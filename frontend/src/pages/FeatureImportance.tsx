import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import { BookOpen, BarChart3, Search, Info } from 'lucide-react';

interface ImportanceItem {
  name: string;
  lr: number;
  rf: number;
}

// GLOSSARY DATA FOR THE 30 FEATURES
const FEATURE_GLOSSARY = [
  { group: 'Mean', name: 'radius_mean', label: 'Radius Mean', desc: 'Average distance from center to points on the outer perimeter of the tumor. Larger values correlate with larger tumor mass.' },
  { group: 'Mean', name: 'texture_mean', label: 'Texture Mean', desc: 'Standard deviation of gray-scale values in the cell nucleus image. Reflects the variance in surface roughness.' },
  { group: 'Mean', name: 'perimeter_mean', label: 'Perimeter Mean', desc: 'The average distance around the boundary of the tumor cell cluster.' },
  { group: 'Mean', name: 'area_mean', label: 'Area Mean', desc: 'The average surface area of the tumor cells.' },
  { group: 'Mean', name: 'smoothness_mean', label: 'Smoothness Mean', desc: 'Local variation in cell nucleus radius lengths, representing nuclear membrane consistency.' },
  { group: 'Mean', name: 'compactness_mean', label: 'Compactness Mean', desc: 'Derived as (perimeter^2 / area - 1.0). Denotes how closely packed the cells are.' },
  { group: 'Mean', name: 'concavity_mean', label: 'Concavity Mean', desc: 'Average severity of concave portions of the nucleus contour. High concavity indicates irregular cell shapes.' },
  { group: 'Mean', name: 'concave points_mean', label: 'Concave Points Mean', desc: 'Average number of concave portions on the outer contour. Critical metric for cell irregularity.' },
  { group: 'Mean', name: 'symmetry_mean', label: 'Symmetry Mean', desc: 'Symmetrical balance of the cell nuclear structure. Malignant nuclei tend to be highly asymmetric.' },
  { group: 'Mean', name: 'fractal_dimension_mean', label: 'Fractal Dimension Mean', desc: 'Measure of the boundary roughness using fractal geometry ("coastline approximation").' },
  { group: 'Standard Error', name: 'radius_se', label: 'Radius SE', desc: 'Standard error of the radius measurements. Indicates the volatility/variance in tumor radius.' },
  { group: 'Standard Error', name: 'texture_se', label: 'Texture SE', desc: 'Standard error of cell surface texture measurements.' },
  { group: 'Standard Error', name: 'perimeter_se', label: 'Perimeter SE', desc: 'Standard error of cell perimeter measurements.' },
  { group: 'Standard Error', name: 'area_se', label: 'Area SE', desc: 'Standard error of cell area measurements.' },
  { group: 'Standard Error', name: 'smoothness_se', label: 'Smoothness SE', desc: 'Standard error of cell membrane smoothness.' },
  { group: 'Standard Error', name: 'compactness_se', label: 'Compactness SE', desc: 'Standard error of cell compactness.' },
  { group: 'Standard Error', name: 'concavity_se', label: 'Concavity SE', desc: 'Standard error of cell nuclear concavity.' },
  { group: 'Standard Error', name: 'concave points_se', label: 'Concave Points SE', desc: 'Standard error of concave points on cell nuclear boundaries.' },
  { group: 'Standard Error', name: 'symmetry_se', label: 'Symmetry SE', desc: 'Standard error of cell nuclear symmetry.' },
  { group: 'Standard Error', name: 'fractal_dimension_se', label: 'Fractal Dimension SE', desc: 'Standard error of the fractal dimension of the boundaries.' },
  { group: 'Worst (Largest)', name: 'radius_worst', label: 'Radius Worst', desc: 'Mean of the three largest radius measurements. Reflects the worst-case size expansion of the tumor.' },
  { group: 'Worst (Largest)', name: 'texture_worst', label: 'Texture Worst', desc: 'Mean of the three largest texture measurements. Represents maximum nuclear roughness.' },
  { group: 'Worst (Largest)', name: 'perimeter_worst', label: 'Perimeter Worst', desc: 'Mean of the three largest tumor perimeter measurements.' },
  { group: 'Worst (Largest)', name: 'area_worst', label: 'Area Worst', desc: 'Mean of the three largest area measurements. Correlates heavily with invasive cancer potential.' },
  { group: 'Worst (Largest)', name: 'smoothness_worst', label: 'Smoothness Worst', desc: 'Mean of the three largest smoothness values recorded for the patient.' },
  { group: 'Worst (Largest)', name: 'compactness_worst', label: 'Compactness Worst', desc: 'Mean of the three largest compactness values.' },
  { group: 'Worst (Largest)', name: 'concavity_worst', label: 'Concavity Worst', desc: 'Mean of the three largest concavity values. Highly representative of malignant structural changes.' },
  { group: 'Worst (Largest)', name: 'concave points_worst', label: 'Concave Points Worst', desc: 'Mean of the three largest concave point counts.' },
  { group: 'Worst (Largest)', name: 'symmetry_worst', label: 'Symmetry Worst', desc: 'Mean of the three largest symmetry values. Denotes worst-case cellular imbalance.' },
  { group: 'Worst (Largest)', name: 'fractal_dimension_worst', label: 'Fractal Dimension Worst', desc: 'Mean of the three largest fractal dimension values.' }
];

export const FeatureImportance: React.FC = () => {
  const [data, setData] = useState<ImportanceItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modelTab, setModelTab] = useState<'rf' | 'lr'>('rf');

  useEffect(() => {
    const fetchImportance = async () => {
      try {
        setLoading(true);
        const res = await api.getFeatureImportance();
        setData(res);
      } catch (err: any) {
        setError('Failed to fetch feature importance dataset.');
      } finally {
        setLoading(false);
      }
    };
    fetchImportance();
  }, []);

  // Filter glossary based on search
  const filteredGlossary = FEATURE_GLOSSARY.filter(item => 
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.desc.toLowerCase().includes(search.toLowerCase())
  );

  // Sort importance data based on selected model tab (highest first, select top 12 for clean charts)
  const chartData = [...data]
    .sort((a, b) => (modelTab === 'rf' ? b.rf - a.rf : b.lr - a.lr))
    .slice(0, 12);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading feature metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '12px' }}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="animated-fadeIn">
      {/* Chart Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="card-title" style={{ margin: 0 }}><BarChart3 size={20} className="text-primary" /> Global Feature Importance Benchmarks</h3>
          
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px' }}>
            <button 
              className={`btn ${modelTab === 'rf' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 16px', fontSize: '12px' }}
              onClick={() => setModelTab('rf')}
            >
              Random Forest Gini
            </button>
            <button 
              className={`btn ${modelTab === 'lr' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 16px', fontSize: '12px' }}
              onClick={() => setModelTab('lr')}
            >
              Logistic Reg. Weight
            </button>
          </div>
        </div>
        
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.4 }}>
          {modelTab === 'rf' 
            ? "Random Forest importances represent Mean Decrease in Impurity (Gini importance). Features at the top are most critical in splitting trees and identifying tumor malignant structures."
            : "Logistic Regression weights represent the absolute value of coefficients on standardized features. Features with high values have the strongest log-odds multiplier effect on predictions."
          }
        </p>

        <div style={{ height: '320px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              layout="vertical" 
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis type="number" fontSize={10} stroke="var(--text-secondary)" />
              <YAxis dataKey="name" type="category" fontSize={9} stroke="var(--text-secondary)" width={120} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)', color: '#fff' }}
              />
              <Bar 
                dataKey={modelTab} 
                fill={modelTab === 'rf' ? 'var(--primary)' : 'var(--success)'}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Glossary Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 className="card-title" style={{ margin: 0 }}><BookOpen size={20} className="text-primary" /> Medical Feature Glossary</h3>
          
          {/* Search bar */}
          <div style={{ position: 'relative', width: '300px' }}>
            <span style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Search size={16} />
            </span>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search features (e.g., perimeter)..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', width: '100%' }}
            />
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          The Wisconsin Breast Cancer dataset measures 10 nuclear features, which are divided into 3 measurement categories: <strong>Mean</strong> values, <strong>Standard Error (SE)</strong> reflecting cellular variance, and <strong>Worst</strong> reflecting largest outlier observations.
        </p>

        {/* Glossary Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', maxHeight: '450px', overflowY: 'auto', paddingRight: '8px' }}>
          {filteredGlossary.map(item => (
            <div 
              key={item.name} 
              style={{ 
                padding: '16px', 
                backgroundColor: 'rgba(255,255,255,0.01)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px',
                display: 'flex',
                gap: '12px'
              }}
            >
              <div style={{ color: 'var(--primary)', marginTop: '2px' }}>
                <Info size={16} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '14px', color: '#fff' }}>{item.label}</strong>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                    {item.group}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {item.desc}
                </p>
                <code style={{ fontSize: '10px', color: 'var(--primary)', display: 'block', marginTop: '6px' }}>
                  ID: {item.name}
                </code>
              </div>
            </div>
          ))}
          {filteredGlossary.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', gridColumn: '1/-1', textAlign: 'center', padding: '24px' }}>
              No matching clinical features found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
