import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getNDVITrend, getRainfallTrend } from '../services/api';
import './ReportGenerator.css';

const ReportGenerator = ({ county }) => {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    if (!county) return;
    setGenerating(true);

    try {
      // Fetch chart data for the report
      const [ndviData, rainfallData] = await Promise.all([
        getNDVITrend(county.ogc_fid),
        getRainfallTrend(county.ogc_fid)
      ]);

      // Create PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // ---- HEADER ----
      // Green header bar
      doc.setFillColor(26, 92, 56);
      doc.rect(0, 0, pageWidth, 35, 'F');

      // Title text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Kenya Climate & Environmental Intelligence Platform', 14, 14);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Environmental Assessment Report', 14, 24);

      // Date top right
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
      })}`, pageWidth - 14, 24, { align: 'right' });

      // ---- COUNTY NAME ----
      doc.setTextColor(26, 92, 56);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(`${county.adm1_name} County`, 14, 50);

      // Divider line
      doc.setDrawColor(26, 92, 56);
      doc.setLineWidth(0.5);
      doc.line(14, 54, pageWidth - 14, 54);

      // ---- RISK SCORE BOX ----
      const scoreColor = county.risk_score >= 8 ? [215, 48, 39] :
                         county.risk_score >= 6 ? [252, 141, 89] :
                         county.risk_score >= 4 ? [254, 224, 139] :
                         [145, 207, 96];

      doc.setFillColor(...scoreColor);
      doc.roundedRect(14, 58, 80, 22, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('OVERALL RISK SCORE', 54, 66, { align: 'center' });
      doc.setFontSize(16);
      doc.text(`${county.risk_score || 'N/A'} / 10`, 54, 75, { align: 'center' });

      // Area box
      doc.setFillColor(240, 247, 244);
      doc.roundedRect(100, 58, 95, 22, 3, 3, 'F');
      doc.setTextColor(26, 92, 56);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('COUNTY AREA', 147, 66, { align: 'center' });
      doc.setFontSize(13);
      doc.text(
        `${county.area_sqkm ? Math.round(county.area_sqkm).toLocaleString() : 'N/A'} km²`,
        147, 75, { align: 'center' }
      );

      // ---- CLIMATE INDICATORS TABLE ----
      doc.setTextColor(26, 92, 56);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Climate Risk Indicators', 14, 92);

      autoTable(doc, {
        startY: 96,
        head: [['Indicator', 'Value', 'Status']],
        body: [
          [
            'Drought Risk',
            county.drought_risk || 'No data',
            county.drought_risk === 'High' ? '⚠️ Requires attention' :
            county.drought_risk === 'Medium' ? '⚡ Monitor closely' : '✅ Within normal range'
          ],
          [
            'Flood Risk',
            county.flood_risk || 'No data',
            county.flood_risk === 'High' ? '⚠️ Requires attention' :
            county.flood_risk === 'Medium' ? '⚡ Monitor closely' : '✅ Within normal range'
          ],
          [
            'Rainfall Trend',
            county.rainfall_trend || 'No data',
            county.rainfall_trend === 'Decreasing' ? '⚠️ Significant decline' :
            county.rainfall_trend === 'Slightly Decreasing' ? '⚡ Slight decline' : '✅ Stable'
          ],
          [
            'Vegetation Change',
            county.vegetation_change ? `${county.vegetation_change}%` : 'No data',
            county.vegetation_change < -10 ? '⚠️ Significant loss' :
            county.vegetation_change < 0 ? '⚡ Slight loss' : '✅ Stable or gaining'
          ],
        ],
        headStyles: {
          fillColor: [26, 92, 56],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [240, 247, 244] },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 45 },
          1: { cellWidth: 40 },
          2: { cellWidth: 90 }
        }
      });

      // ---- NDVI TABLE ----
      const ndviY = doc.lastAutoTable.finalY + 10;
      doc.setTextColor(26, 92, 56);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Vegetation Health (NDVI) Over Time', 14, ndviY);

      autoTable(doc, {
        startY: ndviY + 4,
        head: [['Year', 'NDVI Value', 'Health Status', 'Interpretation']],
        body: ndviData.map(d => {
          const ndvi = parseFloat(d.ndvi_value);
          const health = ndvi >= 0.6 ? 'Healthy' :
                         ndvi >= 0.4 ? 'Moderate' :
                         ndvi >= 0.2 ? 'Sparse' : 'Bare/Desert';
          const interpretation = ndvi >= 0.6 ? 'Dense healthy vegetation' :
                                 ndvi >= 0.4 ? 'Moderate vegetation cover' :
                                 ndvi >= 0.2 ? 'Sparse vegetation, degradation risk' :
                                 'Severely degraded or arid';
          return [
            new Date(d.date).getFullYear(),
            ndvi.toFixed(4),
            health,
            interpretation
          ];
        }),
        headStyles: {
          fillColor: [44, 122, 75],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [240, 247, 244] },
      });

      // ---- RAINFALL TABLE ----
      const rainY = doc.lastAutoTable.finalY + 10;

      // Check if we need a new page
      if (rainY > 230) {
        doc.addPage();
        doc.setFillColor(26, 92, 56);
        doc.rect(0, 0, pageWidth, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text(`${county.adm1_name} County — Climate Report (continued)`, 14, 8);
      }

      const rainStartY = rainY > 230 ? 20 : rainY;
      doc.setTextColor(26, 92, 56);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Annual Rainfall Data', 14, rainStartY);

      autoTable(doc, {
        startY: rainStartY + 4,
        head: [['Year', 'Rainfall (mm)', 'Classification', 'Notes']],
        body: rainfallData.map(d => {
          const mm = parseFloat(d.rainfall_mm);
          const classification = mm < 500 ? 'Very Dry' :
                                 mm < 800 ? 'Dry' :
                                 mm < 1200 ? 'Normal' : 'Wet';
          const notes = mm < 500 ? 'High drought risk — immediate attention' :
                        mm < 800 ? 'Below average — monitor closely' :
                        mm < 1200 ? 'Within normal range' :
                        'Above average — possible flood risk';
          return [
            new Date(d.date).getFullYear(),
            `${mm.toFixed(0)}mm`,
            classification,
            notes
          ];
        }),
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [235, 245, 251] },
      });

      // ---- RECOMMENDATIONS ----
      const recY = doc.lastAutoTable.finalY + 10;
      doc.setTextColor(26, 92, 56);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommendations', 14, recY);

      // Build recommendations based on data
      const recommendations = [];
      if (county.drought_risk === 'High') {
        recommendations.push('• Implement emergency drought response measures immediately');
        recommendations.push('• Deploy water trucking and establish water points');
        recommendations.push('• Activate NDMA drought contingency fund');
      }
      if (county.rainfall_trend === 'Decreasing') {
        recommendations.push('• Invest in water harvesting infrastructure');
        recommendations.push('• Promote drought-resistant crop varieties');
      }
      if (county.vegetation_change < -10) {
        recommendations.push('• Launch reforestation and land restoration programs');
        recommendations.push('• Enforce land use policies to prevent further degradation');
      }
      if (recommendations.length === 0) {
        recommendations.push('• Continue regular monitoring of climate indicators');
        recommendations.push('• Maintain current land management practices');
      }

      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      recommendations.forEach((rec, i) => {
        doc.text(rec, 14, recY + 8 + (i * 7));
      });

      // ---- FOOTER ----
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(240, 247, 244);
        doc.rect(0, 282, pageWidth, 15, 'F');
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text(
          'Kenya Climate & Environmental Intelligence Platform — Confidential',
          14, 290
        );
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - 14, 290, { align: 'right' }
        );
        doc.text(
          'Data sources: MODIS/NASA, CHIRPS/UCSB, Kenya NDMA',
          pageWidth / 2, 290, { align: 'center' }
        );
      }

      // Save the PDF
      doc.save(`${county.adm1_name}_Climate_Report_${new Date().getFullYear()}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
    }
    setGenerating(false);
  };

  if (!county) return null;

  return (
    <div className="report-generator">
      <button
        className="report-btn"
        onClick={generatePDF}
        disabled={generating}
      >
        {generating ? '⏳ Generating...' : '📄 Download PDF Report'}
      </button>
    </div>
  );
};

export default ReportGenerator;