import React, { useState, useMemo, useEffect } from 'react';
import Plot from 'react-plotly.js';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
  Checkbox,
  ListItemText,
  Chip,
} from '@mui/material';

interface PlotlyScoresChartProps {
  scoresData: Record<string, Record<string, unknown>>;
  visibleScoreKeys: Set<string>;
  onToggleScoreSeries: (key: string) => void;
  setVisibleScoreKeys: (keys: Set<string>) => void;
}

const PlotlyScoresChart: React.FC<PlotlyScoresChartProps> = ({
  scoresData,
  visibleScoreKeys,
  onToggleScoreSeries,
  setVisibleScoreKeys,
}) => {
  const scoreEntries = useMemo(() => Object.entries(scoresData || {}), [scoresData]);
  
  const scoreMetricKeys = useMemo(() => {
    if (!scoreEntries.length) return [] as string[];
    const sample = scoreEntries[0][1] as Record<string, unknown>;
    return Object.keys(sample).filter((key) => {
      const v = sample[key as keyof typeof sample];
      return typeof v === 'number' && v >= 0 && v <= 1;
    });
  }, [scoreEntries]);

  // Line styles for colorblind accessibility
  const lineStyles = ['solid', 'dash', 'dot', 'dashdot'];
  const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f'];

  const toTitle = (k: string) => k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  // Transform data for Plotly
  const plotData = useMemo(() => {
    if (!scoreEntries.length || !scoreMetricKeys.length) return [];

    const data = scoreEntries
      .map(([x, obj]) => {
        const row: Record<string, number | null> & { x: number } = { x: Number(x) };
        for (const k of scoreMetricKeys) {
          const val = (obj as Record<string, unknown>)[k];
          const num = typeof val === 'number' ? val : NaN;
          row[k] = Number.isFinite(num) && num >= 0 && num <= 1 ? num : null;
        }
        return row;
      })
      .sort((a, b) => a.x - b.x);

    return scoreMetricKeys
      .filter(k => visibleScoreKeys.has(k))
      .map((key, index) => {
        // Keep all data points but handle null values properly
        const xValues = data.map(d => d.x);
        const yValues = data.map(d => d[key]);
        
        const lineColor = colors[index % colors.length];
        return {
          x: xValues,
          y: yValues,
          type: 'scatter' as const,
          mode: 'lines+markers' as const,
          name: toTitle(key),
          line: {
            color: lineColor,
            dash: lineStyles[index % lineStyles.length] as any,
            width: 2,
          },
          marker: {
            size: 4,
            color: lineColor,
          },
          hovertemplate: `<b>${toTitle(key)}</b><br>X: %{x}<br>Y: %{y:.3f}<extra></extra>`,
          connectgaps: false, // Don't connect lines across null values
          // Add text labels at the start of each line
          text: [toTitle(key), ...Array(xValues.length - 1).fill('')],
          textposition: 'top right' as const,
          textfont: {
            size: 12,
            color: lineColor,
          },
          // Custom hover styling to match line color
          hoverlabel: {
            bgcolor: lineColor,
            bordercolor: lineColor,
            font: {
              family: 'Arial, sans-serif',
              size: 12,
              color: '#ffffff'
            }
          }
        };
      });
  }, [scoreEntries, scoreMetricKeys, visibleScoreKeys]);

  const layout = {
    title: {
      text: 'Scores Overview - Plotly Chart',
      font: { size: 16, family: 'Arial, sans-serif' },
    },
    xaxis: {
      showgrid: true,
      gridcolor: '#f0f0f0',
      gridwidth: 1,
    },
    yaxis: {
      title: { text: 'Score Value' },
      range: [0, 1],
      showgrid: true,
      gridcolor: '#f0f0f0',
      gridwidth: 1,
    },
    hovermode: 'closest' as const,
    showlegend: true,
    legend: {
      orientation: 'h' as const,
      y: -0.1,
      x: 0.5,
      xanchor: 'center' as const,
    },
    margin: { t: 50, r: 50, b: 80, l: 50 },
    plot_bgcolor: 'white',
    paper_bgcolor: 'white'
  };

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'] as any,
    responsive: true,
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Scores Overview - Plotly Chart
      </Typography>
      
      {/* Dropdown Filters */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'nowrap', alignItems: 'flex-start' }}>
          {/* Talents Dropdown */}
          {(scoreMetricKeys || []).filter(k => k && k.toLowerCase().includes('talent')).length > 0 && (
            <FormControl sx={{ width: '50%', flexShrink: 0 }} size="small">
              <InputLabel sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>🎯 Talents</InputLabel>
              <Select
                multiple
                value={Array.from(visibleScoreKeys).filter(k => k && k.toLowerCase().includes('talent'))}
                onChange={(e) => {
                  const selectedValues = e.target.value as string[];
                  
                  if (selectedValues.includes('select-all-talents')) {
                    const talentKeys = (scoreMetricKeys || []).filter(k => k && k.toLowerCase().includes('talent'));
                    const allSelected = talentKeys.length > 0 && talentKeys.every(k => visibleScoreKeys.has(k));
                    
                    const newKeys = new Set(visibleScoreKeys);
                    if (allSelected) {
                      talentKeys.forEach(k => newKeys.delete(k));
                    } else {
                      talentKeys.forEach(k => newKeys.add(k));
                    }
                    setVisibleScoreKeys(newKeys);
                    return;
                  }
                  
                  const selectedTalents = selectedValues.filter(v => v !== 'select-all-talents');
                  const currentTalents = Array.from(visibleScoreKeys).filter(k => k && k.toLowerCase().includes('talent'));
                  
                  const newKeys = new Set(visibleScoreKeys);
                  currentTalents.forEach(k => newKeys.delete(k));
                  selectedTalents.forEach(k => newKeys.add(k));
                  
                  setVisibleScoreKeys(newKeys);
                }}
                input={<OutlinedInput label="🎯 Talents" />}
                renderValue={(selected) => {
                  const maxVisible = Math.min(6, selected.length);
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
                }}
              >
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
                  }}
                >
                  <Checkbox 
                    checked={(scoreMetricKeys || []).filter(k => k && k.toLowerCase().includes('talent')).length > 0 && 
                             (scoreMetricKeys || []).filter(k => k && k.toLowerCase().includes('talent')).every(k => visibleScoreKeys.has(k))}
                    indeterminate={
                      (scoreMetricKeys || []).filter(k => k && k.toLowerCase().includes('talent')).length > 0 &&
                      !(scoreMetricKeys || []).filter(k => k && k.toLowerCase().includes('talent')).every(k => visibleScoreKeys.has(k)) &&
                      (scoreMetricKeys || []).filter(k => k && k.toLowerCase().includes('talent')).some(k => visibleScoreKeys.has(k))
                    }
                    size="small"
                  />
                  <ListItemText 
                    primary={
                      (scoreMetricKeys || []).filter(k => k && k.toLowerCase().includes('talent')).length > 0 &&
                      (scoreMetricKeys || []).filter(k => k && k.toLowerCase().includes('talent')).every(k => visibleScoreKeys.has(k))
                        ? "Unselect All"
                        : "Select All"
                    } 
                  />
                </MenuItem>
                
                {(scoreMetricKeys || [])
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
          {(scoreMetricKeys || []).filter(k => k && k.toLowerCase().includes('score') && !k.toLowerCase().includes('talent')).length > 0 && (
            <FormControl sx={{ width: '50%', flexShrink: 0 }} size="small">
              <InputLabel sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>📊 Scores</InputLabel>
              <Select
                multiple
                value={Array.from(visibleScoreKeys).filter(k => k && k.toLowerCase().includes('score') && !k.toLowerCase().includes('talent'))}
                onChange={(e) => {
                  const selectedValues = e.target.value as string[];
                  
                  if (selectedValues.includes('select-all-scores')) {
                    const scoreKeys = (scoreMetricKeys || []).filter(k => k && k.toLowerCase().includes('score') && !k.toLowerCase().includes('talent'));
                    const allSelected = scoreKeys.length > 0 && scoreKeys.every(k => visibleScoreKeys.has(k));
                    
                    const newKeys = new Set(visibleScoreKeys);
                    if (allSelected) {
                      scoreKeys.forEach(k => newKeys.delete(k));
                    } else {
                      scoreKeys.forEach(k => newKeys.add(k));
                    }
                    setVisibleScoreKeys(newKeys);
                    return;
                  }
                  
                  const selectedScores = selectedValues.filter(v => v !== 'select-all-scores');
                  const currentScores = Array.from(visibleScoreKeys).filter(k => k && k.toLowerCase().includes('score') && !k.toLowerCase().includes('talent'));
                  
                  const newKeys = new Set(visibleScoreKeys);
                  currentScores.forEach(k => newKeys.delete(k));
                  selectedScores.forEach(k => newKeys.add(k));
                  
                  setVisibleScoreKeys(newKeys);
                }}
                input={<OutlinedInput label="📊 Scores" />}
                renderValue={(selected) => {
                  const maxVisible = Math.min(6, selected.length);
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
                }}
              >
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
                  }}
                >
                  <Checkbox 
                    checked={(scoreMetricKeys || []).filter(k => k && k.toLowerCase().includes('score') && !k.toLowerCase().includes('talent')).length > 0 && 
                             (scoreMetricKeys || []).filter(k => k && k.toLowerCase().includes('score') && !k.toLowerCase().includes('talent')).every(k => visibleScoreKeys.has(k))}
                    indeterminate={
                      (scoreMetricKeys || []).filter(k => k && k.toLowerCase().includes('score') && !k.toLowerCase().includes('talent')).length > 0 &&
                      !(scoreMetricKeys || []).filter(k => k && k.toLowerCase().includes('talent')).every(k => visibleScoreKeys.has(k)) &&
                      (scoreMetricKeys || []).filter(k => k && k.toLowerCase().includes('score') && !k.toLowerCase().includes('talent')).some(k => visibleScoreKeys.has(k))
                    }
                    size="small"
                  />
                  <ListItemText 
                    primary={
                      (scoreMetricKeys || []).filter(k => k && k.toLowerCase().includes('score') && !k.toLowerCase().includes('talent')).length > 0 &&
                      (scoreMetricKeys || []).filter(k => k && k.toLowerCase().includes('score') && !k.toLowerCase().includes('talent')).every(k => visibleScoreKeys.has(k))
                        ? "Unselect All"
                        : "Select All"
                    } 
                  />
                </MenuItem>
                
                {(scoreMetricKeys || [])
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
        </Box>
      </Box>

      {/* Plotly Chart */}
      <Box sx={{ height: 600, width: '100%' }} className="plotly-container">
        <Plot
          data={plotData}
          layout={layout}
          config={config}
          style={{ width: '100%', height: '100%' }}
          className="plotly-chart"
        />
      </Box>
    </Box>
  );
};

export default PlotlyScoresChart;
