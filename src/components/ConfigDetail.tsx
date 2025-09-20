import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Avatar,
  Divider,
  Stack,
  Alert,
  Fade,
  Zoom,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
import {
  ArrowBack,
  TrendingUp,
  TrendingDown,
  Speed,
  Psychology,
  Assessment,
  MoreVert,
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  Download,
  Share,
  Settings,
  Timeline,
  BarChart,
  PieChart,
  ShowChart,
  Schedule,
  CheckCircle,
  Error,
  Warning,
  Info,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Legend, Brush, ReferenceLine } from 'recharts';
import { apiClient } from '../services/api';
import { mockScores } from '../data/mockScores';
import { ConfigDetail as ConfigDetailType } from '../types';
import PlotlyScoresChart from './PlotlyScoresChart';
import CustomTooltip from './CustomTooltip';

const ConfigDetail: React.FC = () => {
  const { configId } = useParams<{ configId: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [configDetail, setConfigDetail] = useState<ConfigDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Scores chart UI state
  const [visibleScoreKeys, setVisibleScoreKeys] = useState<Set<string>>(new Set());
  const scoresData: Record<string, Record<string, unknown>> | undefined = React.useMemo(() => {
    return ((configDetail as any)?.scores as Record<string, Record<string, unknown>> | undefined) ??
      (mockScores as unknown as Record<string, Record<string, unknown>>);
  }, [configDetail]);
  const scoreEntries = React.useMemo(() => Object.entries(scoresData || {}), [scoresData]);
  const scoreMetricKeys = React.useMemo(() => {
    if (!scoreEntries.length) return [] as string[];
    const sample = scoreEntries[0][1] as Record<string, unknown>;
    return Object.keys(sample).filter((key) => {
      const v = sample[key as keyof typeof sample];
      return typeof v === 'number' && v >= 0 && v <= 1;
    });
  }, [scoreEntries]);
  useEffect(() => {
    if (scoreMetricKeys.length && visibleScoreKeys.size === 0) {
      setVisibleScoreKeys(new Set(scoreMetricKeys));
    }
  }, [scoreMetricKeys]);
  const toggleScoreSeries = (key: string) => {
    setVisibleScoreKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const loadConfigDetail = async () => {
    if (!configId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getConfigDetail(configId);
      setConfigDetail(data);
    } catch (err) {
      setError('Failed to load configuration details');
      console.error('Error loading config detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfigDetail();
  }, [configId]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button onClick={loadConfigDetail} variant="contained" startIcon={<Refresh />}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!configDetail) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          Configuration not found. Please check the URL and try again.
        </Alert>
        <Button onClick={() => navigate('/')} startIcon={<ArrowBack />} variant="contained">
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const getEvaluationColor = (result: 'Good' | 'Bad') => {
    return result === 'Good' ? 'success' : 'error';
  };

  const getEvaluationIcon = (result: 'Good' | 'Bad') => {
    return result === 'Good' ? <CheckCircle /> : <Error />;
  };

  const getTrendIcon = (current: number, previous: number) => {
    return current > previous ? <TrendingUp color="success" /> : <TrendingDown color="error" />;
  };

  const getTrendColor = (current: number, previous: number) => {
    return current > previous ? 'success' : 'error';
  };

  const averageEfficiency = configDetail.performance_data.reduce((sum, data) => sum + data.efficiency, 0) / configDetail.performance_data.length;
  const latestEfficiency = configDetail.performance_data[configDetail.performance_data.length - 1]?.efficiency || 0;
  const previousEfficiency = configDetail.performance_data[configDetail.performance_data.length - 2]?.efficiency || 0;
  const efficiencyChange = latestEfficiency - previousEfficiency;

  const successRuns = configDetail.recent_runs.filter(run => run.evaluation_result === 'Good').length;
  const successRate = (successRuns / configDetail.recent_runs.length) * 100;

  const chartColors = {
    primary: '#2563eb',
    secondary: '#7c3aed',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  };

  const pieData = [
    { name: 'Good Runs', value: successRuns, color: chartColors.success },
    { name: 'Bad Runs', value: configDetail.recent_runs.length - successRuns, color: chartColors.error },
  ];

  // Build multi-series line chart from optional scores object on configDetail
  const renderScoresChart = () => {
    const scores = scoresData;
    if (!scores || typeof scores !== 'object') return null;

    const xEntries = scoreEntries;
    if (xEntries.length === 0) return null;

    // Keep metric order as given in the object; include only *_score metrics
    const metricKeys = scoreMetricKeys;

    if (metricKeys.length === 0) return null;

    // Transform into recharts-friendly array, sort by numeric x
    const data = xEntries
      .map(([x, obj]) => {
        const row: Record<string, number | null> & { x: number } = { x: Number(x) };
        for (const k of metricKeys) {
          const val = (obj as Record<string, unknown>)[k];
          const num = typeof val === 'number' ? val : NaN;
          // Ignore values outside [0,1]
          row[k] = Number.isFinite(num) && num >= 0 && num <= 1 ? num : null;
        }
        return row;
      })
      .sort((a, b) => a.x - b.x);

    const COLOR_PALETTE = [
      '#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#22c55e', '#eab308', '#f97316',
      '#dc2626', '#0ea5e9', '#14b8a6', '#a3e635', '#f43f5e', '#38bdf8', '#84cc16', '#fb923c', '#6366f1', '#34d399'
    ];

    const toTitle = (k: string) => k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());


    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
          Scores Overview
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'nowrap', alignItems: 'flex-start' }}>
            {/* Talents Dropdown */}
            {(metricKeys || []).filter(k => k && k.toLowerCase().includes('talent')).length > 0 && (
              <FormControl sx={{ width: '50%', flexShrink: 0 }} size="small">
                <InputLabel sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>🎯 Talents</InputLabel>
                <Select
                  multiple
                  value={Array.from(visibleScoreKeys).filter(k => k && k.toLowerCase().includes('talent'))}
                  onChange={(e) => {
                    const selectedValues = e.target.value as string[];
                    
                    // Check if "select-all-talents" was clicked
                    if (selectedValues.includes('select-all-talents')) {
                      const talentKeys = (metricKeys || []).filter(k => k && k.toLowerCase().includes('talent'));
                      const allSelected = talentKeys.length > 0 && talentKeys.every(k => visibleScoreKeys.has(k));
                      
                      const newKeys = new Set(visibleScoreKeys);
                      if (allSelected) {
                        // Unselect all talents
                        talentKeys.forEach(k => newKeys.delete(k));
                      } else {
                        // Select all talents
                        talentKeys.forEach(k => newKeys.add(k));
                      }
                      setVisibleScoreKeys(newKeys);
                      return;
                    }
                    
                    // Regular selection logic
                    const selectedTalents = selectedValues.filter(v => v !== 'select-all-talents');
                    const currentTalents = Array.from(visibleScoreKeys).filter(k => k && k.toLowerCase().includes('talent'));
                    
                    // Remove all current talents
                    const newKeys = new Set(visibleScoreKeys);
                    currentTalents.forEach(k => newKeys.delete(k));
                    
                    // Add selected talents
                    selectedTalents.forEach(k => newKeys.add(k));
                    
                    setVisibleScoreKeys(newKeys);
                  }}
                  input={<OutlinedInput label="🎯 Talents" />}
                  renderValue={(selected) => {
                    const maxVisible = Math.min(6, selected.length); // Show up to 6 chips
                    return (
                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'nowrap', 
                        gap: 0.5, 
                        maxWidth: '100%', 
                        overflow: 'hidden',
                        height: '20px',
                        alignItems: 'center'
                      }}>
                        {selected.slice(0, maxVisible).map((value) => (
                          <Chip 
                            key={value} 
                            label={toTitle(value).replace('Talent', '').trim()} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem', height: '20px' }}
                          />
                        ))}
                        {selected.length > maxVisible && (
                          <Chip 
                            label={`+${selected.length - maxVisible}`} 
                            size="small" 
                            color="primary"
                            variant="filled"
                            sx={{ fontSize: '0.75rem', height: '20px' }}
                          />
                        )}
                      </Box>
                    );
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200,
                        width: 250,
                        minWidth: 250,
                      },
                    },
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left',
                    },
                  }}
                >
                  {/* Select/Unselect All for Talents */}
                  <MenuItem 
                    value="select-all-talents"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    sx={{ 
                      borderBottom: '1px solid #e0e0e0',
                      backgroundColor: '#f5f5f5',
                      fontWeight: 600,
                      '&:hover': { backgroundColor: '#e0e0e0' },
                      '&.Mui-selected': { backgroundColor: '#e0e0e0' }
                    }}
                  >
                    <Checkbox 
                      checked={(metricKeys || []).filter(k => k && k.toLowerCase().includes('talent')).length > 0 && 
                               (metricKeys || []).filter(k => k && k.toLowerCase().includes('talent')).every(k => visibleScoreKeys.has(k))}
                      indeterminate={
                        (metricKeys || []).filter(k => k && k.toLowerCase().includes('talent')).length > 0 &&
                        !(metricKeys || []).filter(k => k && k.toLowerCase().includes('talent')).every(k => visibleScoreKeys.has(k)) &&
                        (metricKeys || []).filter(k => k && k.toLowerCase().includes('talent')).some(k => visibleScoreKeys.has(k))
                      }
                      size="small"
                    />
                    <ListItemText 
                      primary={
                        (metricKeys || []).filter(k => k && k.toLowerCase().includes('talent')).length > 0 &&
                        (metricKeys || []).filter(k => k && k.toLowerCase().includes('talent')).every(k => visibleScoreKeys.has(k))
                          ? "Unselect All"
                          : "Select All"
                      } 
                    />
                  </MenuItem>
                  
                  {(metricKeys || [])
                    .filter(k => k && k.toLowerCase().includes('talent'))
                    .map((k) => (
                      <MenuItem key={k} value={k} sx={{ py: 0.5 }}>
                        <Checkbox checked={visibleScoreKeys.has(k)} size="small" />
                        <ListItemText 
                          primary={toTitle(k).replace('Talent', '').trim()} 
                          primaryTypographyProps={{ fontSize: '0.875rem' }}
                        />
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}

            {/* Scores Dropdown */}
            {(metricKeys || []).filter(k => k && k.toLowerCase().includes('score') && !k.toLowerCase().includes('talent')).length > 0 && (
              <FormControl sx={{ width: '50%', flexShrink: 0 }} size="small">
                <InputLabel sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>📊 Scores</InputLabel>
                <Select
                  multiple
                  value={Array.from(visibleScoreKeys).filter(k => k && k.toLowerCase().includes('score') && !k.toLowerCase().includes('talent'))}
                  onChange={(e) => {
                    const selectedValues = e.target.value as string[];
                    
                    // Check if "select-all-scores" was clicked
                    if (selectedValues.includes('select-all-scores')) {
                      const scoreKeys = (metricKeys || []).filter(k => k && k.toLowerCase().includes('score') && !k.toLowerCase().includes('talent'));
                      const allSelected = scoreKeys.length > 0 && scoreKeys.every(k => visibleScoreKeys.has(k));
                      
                      const newKeys = new Set(visibleScoreKeys);
                      if (allSelected) {
                        // Unselect all scores
                        scoreKeys.forEach(k => newKeys.delete(k));
                      } else {
                        // Select all scores
                        scoreKeys.forEach(k => newKeys.add(k));
                      }
                      setVisibleScoreKeys(newKeys);
                      return;
                    }
                    
                    // Regular selection logic
                    const selectedScores = selectedValues.filter(v => v !== 'select-all-scores');
                    const currentScores = Array.from(visibleScoreKeys).filter(k => k && k.toLowerCase().includes('score') && !k.toLowerCase().includes('talent'));
                    
                    // Remove all current scores
                    const newKeys = new Set(visibleScoreKeys);
                    currentScores.forEach(k => newKeys.delete(k));
                    
                    // Add selected scores
                    selectedScores.forEach(k => newKeys.add(k));
                    
                    setVisibleScoreKeys(newKeys);
                  }}
                  input={<OutlinedInput label="📊 Scores" />}
                  renderValue={(selected) => {
                    const maxVisible = Math.min(6, selected.length); // Show up to 6 chips
                    return (
                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'nowrap', 
                        gap: 0.5, 
                        maxWidth: '100%', 
                        overflow: 'hidden',
                        height: '20px',
                        alignItems: 'center'
                      }}>
                        {selected.slice(0, maxVisible).map((value) => (
                          <Chip 
                            key={value} 
                            label={toTitle(value).replace('Score', '').trim()} 
                            size="small" 
                            color="success"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem', height: '20px' }}
                          />
                        ))}
                        {selected.length > maxVisible && (
                          <Chip 
                            label={`+${selected.length - maxVisible}`} 
                            size="small" 
                            color="success"
                            variant="filled"
                            sx={{ fontSize: '0.75rem', height: '20px' }}
                          />
                        )}
                      </Box>
                    );
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200,
                        width: 250,
                        minWidth: 250,
                      },
                    },
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left',
                    },
                  }}
                >
                  {/* Select/Unselect All for Scores */}
                  <MenuItem 
                    value="select-all-scores"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    sx={{ 
                      borderBottom: '1px solid #e0e0e0',
                      backgroundColor: '#f5f5f5',
                      fontWeight: 600,
                      '&:hover': { backgroundColor: '#e0e0e0' },
                      '&.Mui-selected': { backgroundColor: '#e0e0e0' }
                    }}
                  >
                    <Checkbox 
                      checked={(metricKeys || []).filter(k => k && k.toLowerCase().includes('score') && !k.toLowerCase().includes('talent')).length > 0 && 
                               (metricKeys || []).filter(k => k && k.toLowerCase().includes('score') && !k.toLowerCase().includes('talent')).every(k => visibleScoreKeys.has(k))}
                      indeterminate={
                        (metricKeys || []).filter(k => k && k.toLowerCase().includes('score') && !k.toLowerCase().includes('talent')).length > 0 &&
                        !(metricKeys || []).filter(k => k && k.toLowerCase().includes('score') && !k.toLowerCase().includes('talent')).every(k => visibleScoreKeys.has(k)) &&
                        (metricKeys || []).filter(k => k && k.toLowerCase().includes('score') && !k.toLowerCase().includes('talent')).some(k => visibleScoreKeys.has(k))
                      }
                      size="small"
                    />
                    <ListItemText 
                      primary={
                        (metricKeys || []).filter(k => k && k.toLowerCase().includes('score') && !k.toLowerCase().includes('talent')).length > 0 &&
                        (metricKeys || []).filter(k => k && k.toLowerCase().includes('score') && !k.toLowerCase().includes('talent')).every(k => visibleScoreKeys.has(k))
                          ? "Unselect All"
                          : "Select All"
                      } 
                    />
                  </MenuItem>
                  
                  {(metricKeys || [])
                    .filter(k => k && k.toLowerCase().includes('score') && !k.toLowerCase().includes('talent'))
                    .map((k) => (
                      <MenuItem key={k} value={k} sx={{ py: 0.5 }}>
                        <Checkbox checked={visibleScoreKeys.has(k)} size="small" />
                        <ListItemText 
                          primary={toTitle(k).replace('Score', '').trim()} 
                          primaryTypographyProps={{ fontSize: '0.875rem' }}
                        />
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}

            {/* Other Metrics Dropdown */}
            {(metricKeys || []).filter(k => 
              k && !k.toLowerCase().includes('talent') && 
              !k.toLowerCase().includes('score')
            ).length > 0 && (
              <FormControl sx={{ width: '50%', flexShrink: 0 }} size="small">
                <InputLabel sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>🔧 Other Metrics</InputLabel>
                <Select
                  multiple
                  value={Array.from(visibleScoreKeys).filter(k => 
                    k && !k.toLowerCase().includes('talent') && 
                    !k.toLowerCase().includes('score')
                  )}
                  onChange={(e) => {
                    const selectedValues = e.target.value as string[];
                    
                    // Check if "select-all-others" was clicked
                    if (selectedValues.includes('select-all-others')) {
                      const otherKeys = (metricKeys || []).filter(k => 
                        k && !k.toLowerCase().includes('talent') && 
                        !k.toLowerCase().includes('score')
                      );
                      const allSelected = otherKeys.length > 0 && otherKeys.every(k => visibleScoreKeys.has(k));
                      
                      const newKeys = new Set(visibleScoreKeys);
                      if (allSelected) {
                        // Unselect all others
                        otherKeys.forEach(k => newKeys.delete(k));
                      } else {
                        // Select all others
                        otherKeys.forEach(k => newKeys.add(k));
                      }
                      setVisibleScoreKeys(newKeys);
                      return;
                    }
                    
                    // Regular selection logic
                    const selectedOthers = selectedValues.filter(v => v !== 'select-all-others');
                    const currentOthers = Array.from(visibleScoreKeys).filter(k => 
                      k && !k.toLowerCase().includes('talent') && 
                      !k.toLowerCase().includes('score')
                    );
                    
                    // Remove all current others
                    const newKeys = new Set(visibleScoreKeys);
                    currentOthers.forEach(k => newKeys.delete(k));
                    
                    // Add selected others
                    selectedOthers.forEach(k => newKeys.add(k));
                    
                    setVisibleScoreKeys(newKeys);
                  }}
                  input={<OutlinedInput label="🔧 Other Metrics" />}
                  renderValue={(selected) => {
                    const maxVisible = Math.min(6, selected.length); // Show up to 6 chips
                    return (
                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'nowrap', 
                        gap: 0.5, 
                        maxWidth: '100%', 
                        overflow: 'hidden',
                        height: '20px',
                        alignItems: 'center'
                      }}>
                        {selected.slice(0, maxVisible).map((value) => (
                          <Chip 
                            key={value} 
                            label={toTitle(value)} 
                            size="small" 
                            color="warning"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem', height: '20px' }}
                          />
                        ))}
                        {selected.length > maxVisible && (
                          <Chip 
                            label={`+${selected.length - maxVisible}`} 
                            size="small" 
                            color="warning"
                            variant="filled"
                            sx={{ fontSize: '0.75rem', height: '20px' }}
                          />
                        )}
                      </Box>
                    );
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200,
                        width: 250,
                        minWidth: 250,
                      },
                    },
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left',
                    },
                  }}
                >
                  {/* Select/Unselect All for Other Metrics */}
                  <MenuItem 
                    value="select-all-others"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    sx={{ 
                      borderBottom: '1px solid #e0e0e0',
                      backgroundColor: '#f5f5f5',
                      fontWeight: 600,
                      '&:hover': { backgroundColor: '#e0e0e0' },
                      '&.Mui-selected': { backgroundColor: '#e0e0e0' }
                    }}
                  >
                    <Checkbox 
                      checked={(metricKeys || []).filter(k => 
                        k && !k.toLowerCase().includes('talent') && 
                        !k.toLowerCase().includes('score')
                      ).length > 0 && 
                      (metricKeys || []).filter(k => 
                        k && !k.toLowerCase().includes('talent') && 
                        !k.toLowerCase().includes('score')
                      ).every(k => visibleScoreKeys.has(k))}
                      indeterminate={
                        (metricKeys || []).filter(k => 
                          k && !k.toLowerCase().includes('talent') && 
                          !k.toLowerCase().includes('score')
                        ).length > 0 &&
                        !(metricKeys || []).filter(k => 
                          k && !k.toLowerCase().includes('talent') && 
                          !k.toLowerCase().includes('score')
                        ).every(k => visibleScoreKeys.has(k)) &&
                        (metricKeys || []).filter(k => 
                          k && !k.toLowerCase().includes('talent') && 
                          !k.toLowerCase().includes('score')
                        ).some(k => visibleScoreKeys.has(k))
                      }
                      size="small"
                    />
                    <ListItemText 
                      primary={
                        (metricKeys || []).filter(k => 
                          k && !k.toLowerCase().includes('talent') && 
                          !k.toLowerCase().includes('score')
                        ).length > 0 &&
                        (metricKeys || []).filter(k => 
                          k && !k.toLowerCase().includes('talent') && 
                          !k.toLowerCase().includes('score')
                        ).every(k => visibleScoreKeys.has(k))
                          ? "Unselect All"
                          : "Select All"
                      } 
                    />
                  </MenuItem>
                  
                  {(metricKeys || [])
                    .filter(k => 
                      k && !k.toLowerCase().includes('talent') && 
                      !k.toLowerCase().includes('score')
                    )
                    .map((k) => (
                      <MenuItem key={k} value={k} sx={{ py: 0.5 }}>
                        <Checkbox checked={visibleScoreKeys.has(k)} size="small" />
                        <ListItemText 
                          primary={toTitle(k)} 
                          primaryTypographyProps={{ fontSize: '0.875rem' }}
                        />
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </Box>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="x" type="number" stroke="#666" />
              <YAxis domain={[0, 1]} stroke="#666" tickCount={6} />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                formatter={(value: number, name: string) => [Number(value).toFixed(3), toTitle(name)]}
                labelFormatter={(label) => `X: ${label}`}
              />
              <Legend formatter={(v) => toTitle(String(v))} onClick={(e: any) => toggleScoreSeries(e.dataKey)} />
              {metricKeys.filter(k => visibleScoreKeys.has(k)).map((k, i) => (
                <Line
                  key={k}
                  type="linear"
                  dataKey={k}
                  name={toTitle(k)}
                  stroke={COLOR_PALETTE[i % COLOR_PALETTE.length]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                />
              ))}
              <Brush dataKey="x" height={24} stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    );
  };

  const renderChart = () => {
    const commonProps = {
      data: configDetail.performance_data,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis domain={[30, 45]} stroke="#666" />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
              formatter={(value: number) => [value.toFixed(1), 'Efficiency']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="efficiency"
              stroke={chartColors.primary}
              fill={chartColors.primary}
              fillOpacity={0.3}
              strokeWidth={3}
            />
          </AreaChart>
        );
      case 'bar':
        return (
          <RechartsBarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis domain={[30, 45]} stroke="#666" />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
              formatter={(value: number) => [value.toFixed(1), 'Efficiency']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Bar dataKey="efficiency" fill={chartColors.primary} radius={[4, 4, 0, 0]} />
          </RechartsBarChart>
        );
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis domain={[30, 45]} stroke="#666" />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
              formatter={(value: number) => [value.toFixed(1), 'Efficiency']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="efficiency"
              stroke={chartColors.primary}
              strokeWidth={3}
              dot={{ fill: chartColors.primary, strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: chartColors.primary, strokeWidth: 2 }}
            />
          </LineChart>
        );
    }
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button
            onClick={() => navigate('/')}
            startIcon={<ArrowBack />}
            variant="outlined"
            sx={{ minWidth: 'auto' }}
          >
            Back
          </Button>
          <Divider orientation="vertical" flexItem />
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 48,
              height: 48,
              fontSize: '1.25rem',
              fontWeight: 600,
            }}
          >
            {configDetail.name.charAt(0)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {configDetail.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Configuration ID: {configDetail.id}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <CustomTooltip title="Refresh Data">
              <IconButton onClick={handleRefresh} disabled={isRefreshing}>
                <Refresh />
              </IconButton>
            </CustomTooltip>
            <CustomTooltip title="More Options">
              <IconButton onClick={handleMenuOpen}>
                <MoreVert />
              </IconButton>
            </CustomTooltip>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Current Efficiency
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="primary.main">
                      {latestEfficiency.toFixed(1)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                      {getTrendIcon(latestEfficiency, previousEfficiency)}
                      <Typography
                        variant="caption"
                        color={getTrendColor(latestEfficiency, previousEfficiency) + '.main'}
                        fontWeight={500}
                      >
                        {efficiencyChange > 0 ? '+' : ''}{efficiencyChange.toFixed(1)}
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56 }}>
                    <Speed />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Average Efficiency
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="success.main">
                      {averageEfficiency.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Over {configDetail.performance_data.length} runs
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.light', width: 56, height: 56 }}>
                    <Assessment />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Success Rate
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="success.main">
                      {successRate.toFixed(0)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {successRuns} of {configDetail.recent_runs.length} runs
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.light', width: 56, height: 56 }}>
                    <CheckCircle />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Total Runs
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="info.main">
                      {configDetail.recent_runs.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Recent activity
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.light', width: 56, height: 56 }}>
                    <Timeline />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Performance Overview" icon={<ShowChart />} />
          <Tab label="Run History" icon={<Timeline />} />
          <Tab label="Analytics" icon={<BarChart />} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Fade in timeout={300}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  {/* Plotly Chart */}
                  <PlotlyScoresChart
                    scoresData={scoresData}
                    visibleScoreKeys={visibleScoreKeys}
                    onToggleScoreSeries={toggleScoreSeries}
                    setVisibleScoreKeys={setVisibleScoreKeys}
                  />
                  
                  {/* Original Recharts Chart */}
                  {renderScoresChart()}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight={600}>
                      Performance Trend
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <CustomTooltip title="Line Chart">
                        <IconButton
                          onClick={() => setChartType('line')}
                          color={chartType === 'line' ? 'primary' : 'default'}
                        >
                          <ShowChart />
                        </IconButton>
                      </CustomTooltip>
                      <CustomTooltip title="Area Chart">
                        <IconButton
                          onClick={() => setChartType('area')}
                          color={chartType === 'area' ? 'primary' : 'default'}
                        >
                          <BarChart />
                        </IconButton>
                      </CustomTooltip>
                      <CustomTooltip title="Bar Chart">
                        <IconButton
                          onClick={() => setChartType('bar')}
                          color={chartType === 'bar' ? 'primary' : 'default'}
                        >
                          <PieChart />
                        </IconButton>
                      </CustomTooltip>
                    </Box>
                  </Box>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      {renderChart()}
                    </ResponsiveContainer>
                  </Box>
                  
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>
      )}

      {tabValue === 1 && (
        <Fade in timeout={300}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Recent Runs
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.50' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Run ID</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Efficiency</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {configDetail.recent_runs.map((run, index) => (
                          <Fade in timeout={300 + index * 100} key={run.id}>
                            <TableRow
                              hover
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'action.hover',
                                },
                              }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Badge
                                    color="primary"
                                    sx={{ '& .MuiBadge-badge': { fontSize: '0.75rem' } }}
                                  >
                                    <Typography variant="body2" fontWeight={600}>
                                      {run.id}
                                    </Typography>
                                  </Badge>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {run.date}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" fontWeight={500}>
                                    {run.efficiency.toFixed(1)}
                                  </Typography>
                                  <LinearProgress
                                    variant="determinate"
                                    value={(run.efficiency / 45) * 100}
                                    sx={{ width: 60, height: 6, borderRadius: 3 }}
                                    color={run.efficiency >= 40 ? 'success' : run.efficiency >= 35 ? 'warning' : 'error'}
                                  />
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={getEvaluationIcon(run.evaluation_result)}
                                  label={run.evaluation_result}
                                  color={getEvaluationColor(run.evaluation_result)}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <IconButton size="small">
                                  <MoreVert />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          </Fade>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>
      )}

      {tabValue === 2 && (
        <Fade in timeout={300}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Success Distribution
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <RechartsTooltip />
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Performance Summary
                  </Typography>
                  <Stack spacing={3} sx={{ mt: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Efficiency Range
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {Math.min(...configDetail.performance_data.map(d => d.efficiency)).toFixed(1)} - {Math.max(...configDetail.performance_data.map(d => d.efficiency)).toFixed(1)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={((latestEfficiency - 30) / (45 - 30)) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                        color="primary"
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Consistency
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {((1 - (Math.max(...configDetail.performance_data.map(d => d.efficiency)) - Math.min(...configDetail.performance_data.map(d => d.efficiency))) / 15) * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={((1 - (Math.max(...configDetail.performance_data.map(d => d.efficiency)) - Math.min(...configDetail.performance_data.map(d => d.efficiency))) / 15) * 100)}
                        sx={{ height: 8, borderRadius: 4 }}
                        color="success"
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Improvement Trend
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {efficiencyChange > 0 ? '+' : ''}{efficiencyChange.toFixed(1)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.max(0, Math.min(100, ((efficiencyChange + 5) / 10) * 100))}
                        sx={{ height: 8, borderRadius: 4 }}
                        color={efficiencyChange > 0 ? 'success' : 'error'}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <PlayArrow />
          </ListItemIcon>
          <ListItemText>Start New Run</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Download />
          </ListItemIcon>
          <ListItemText>Export Data</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Share />
          </ListItemIcon>
          <ListItemText>Share Results</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText>Configure</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ConfigDetail;
