import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  Box,
  IconButton,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Tooltip,
  Fade,
  Zoom,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Stack,
  Alert,
  Skeleton,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle,
  ArrowForward,
  TrendingUp,
  TrendingDown,
  Speed,
  Psychology,
  Assessment,
  Search,
  FilterList,
  Refresh,
  MoreVert,
  PlayArrow,
  Pause,
  Stop,
  Schedule,
  Warning,
  Error,
  Info,
} from '@mui/icons-material';
import { apiClient } from '../services/api';
import { Config, DashboardOverview as DashboardOverviewType } from '../types';

const DashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('efficiency');
  const [isLoading, setIsLoading] = useState(false);
  const [configs, setConfigs] = useState<Config[]>([]);
  const [summary, setSummary] = useState<DashboardOverviewType['summary'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConfigClick = (configId: string) => {
    navigate(`/config/${configId}`);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loadData();
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const data = await apiClient.getDashboardOverview();
      setConfigs(data.configs);
      setSummary(data.summary);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getMetricColor = (value: number, type: 'efficiency' | 'growth' | 'semantic') => {
    if (type === 'efficiency') {
      if (value >= 0.8) return 'success';
      if (value >= 0.6) return 'warning';
      return 'error';
    }
    if (type === 'growth') {
      if (value >= 0.8) return 'success';
      if (value >= 0.6) return 'warning';
      return 'error';
    }
    if (type === 'semantic') {
      if (value >= 0.75) return 'success';
      if (value >= 0.6) return 'warning';
      return 'error';
    }
    return 'default';
  };

  const getMetricIcon = (value: number, type: 'efficiency' | 'growth' | 'semantic') => {
    if (type === 'efficiency') {
      return value >= 0.8 ? <TrendingUp /> : <TrendingDown />;
    }
    if (type === 'growth') {
      return value >= 0.8 ? <TrendingUp /> : <TrendingDown />;
    }
    if (type === 'semantic') {
      return value >= 0.75 ? <TrendingUp /> : <TrendingDown />;
    }
    return <Assessment />;
  };

  const filteredConfigs = configs.filter((config) => {
    const matchesSearch = config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         config.evaluation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'success' && config.last_run.status === 'success') ||
                         (statusFilter === 'failure' && config.last_run.status === 'failure');
    return matchesSearch && matchesStatus;
  });

  const sortedConfigs = [...filteredConfigs].sort((a, b) => {
    switch (sortBy) {
      case 'efficiency':
        return b.efficiency - a.efficiency;
      case 'growth':
        return b.growth_quality - a.growth_quality;
      case 'semantic':
        return b.semantic_score - a.semantic_score;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={handleRefresh} variant="contained" startIcon={<Refresh />}>
          Retry
        </Button>
      </Box>
    );
  }

  if (configs.length === 0 && !isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
          Model Training Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Monitor and analyze your LLM training configurations and performance metrics
        </Typography>
        
        {/* Quick Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Average Efficiency
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="primary.main">
                      {summary ? (summary.average_efficiency * 100).toFixed(1) : '0.0'}%
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56 }}>
                    <Speed />
                  </Avatar>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={summary ? summary.average_efficiency * 100 : 0}
                  sx={{ mt: 2, height: 6, borderRadius: 3 }}
                  color="primary"
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Growth Quality
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="success.main">
                      {summary ? (summary.average_growth_quality * 100).toFixed(1) : '0.0'}%
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.light', width: 56, height: 56 }}>
                    <TrendingUp />
                  </Avatar>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={summary ? summary.average_growth_quality * 100 : 0}
                  sx={{ mt: 2, height: 6, borderRadius: 3 }}
                  color="success"
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Semantic Score
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="info.main">
                      {summary ? (summary.average_semantic_score * 100).toFixed(1) : '0.0'}%
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.light', width: 56, height: 56 }}>
                    <Psychology />
                  </Avatar>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={summary ? summary.average_semantic_score * 100 : 0}
                  sx={{ mt: 2, height: 6, borderRadius: 3 }}
                  color="info"
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Success Rate
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="success.main">
                      {summary ? summary.success_rate.toFixed(0) : '0'}%
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.light', width: 56, height: 56 }}>
                    <CheckCircle />
                  </Avatar>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={summary ? summary.success_rate : 0}
                  sx={{ mt: 2, height: 6, borderRadius: 3 }}
                  color="success"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Controls Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search configurations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="failure">Failure</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="efficiency">Efficiency</MenuItem>
                <MenuItem value="growth">Growth Quality</MenuItem>
                <MenuItem value="semantic">Semantic Score</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ flexGrow: 1 }} />
            
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Configuration</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Last Run</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Efficiency</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Growth Quality</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Semantic Score</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Evaluation</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  sortedConfigs.map((config, index) => (
                    <Fade in timeout={300 + index * 100} key={config.id}>
                      <TableRow
                        hover
                        sx={{
                          '&:hover': {
                            backgroundColor: 'action.hover',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                          },
                          transition: 'all 0.2s ease-in-out',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleConfigClick(config.id)}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: 'primary.main',
                                width: 40,
                                height: 40,
                                fontSize: '0.875rem',
                                fontWeight: 600,
                              }}
                            >
                              {config.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight={600} color="text.primary">
                                {config.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {config.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle color="success" fontSize="small" />
                            <Box>
                              <Typography variant="body2" fontWeight={500} color="success.main">
                                {config.last_run.status === 'success' ? 'Success' : 'Failure'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {config.last_run.date}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              icon={getMetricIcon(config.efficiency, 'efficiency')}
                              label={`${(config.efficiency * 100).toFixed(1)}%`}
                              color={getMetricColor(config.efficiency, 'efficiency')}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              icon={getMetricIcon(config.growth_quality, 'growth')}
                              label={`${(config.growth_quality * 100).toFixed(1)}%`}
                              color={getMetricColor(config.growth_quality, 'growth')}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              icon={getMetricIcon(config.semantic_score, 'semantic')}
                              label={`${(config.semantic_score * 100).toFixed(1)}%`}
                              color={getMetricColor(config.semantic_score, 'semantic')}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Tooltip title={config.evaluation} arrow>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                maxWidth: 200,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {config.evaluation}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details" arrow>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConfigClick(config.id);
                                }}
                              >
                                <ArrowForward />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="More Options" arrow>
                              <IconButton
                                size="small"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVert />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </Fade>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Empty State */}
      {!isLoading && sortedConfigs.length === 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Info color="disabled" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No configurations found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filter criteria
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DashboardOverview;
