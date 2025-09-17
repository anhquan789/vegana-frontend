import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CVProfile, CVExportOptions } from '../../types/cv';

export class CVExportService {
  /**
   * Export CV as PDF
   */
  static async exportToPDF(
    cv: CVProfile,
    options: CVExportOptions = {
      format: 'pdf',
      quality: 'high',
      includeImages: true,
      includeLinks: true
    }
  ): Promise<void> {
    try {
      // Create a temporary div with the CV content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm'; // A4 width
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '20mm';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.5';
      tempDiv.style.color = '#333';

      // Generate HTML content
      tempDiv.innerHTML = this.generateHTMLContent(cv, options);
      document.body.appendChild(tempDiv);

      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: options.quality === 'high' ? 2 : options.quality === 'medium' ? 1.5 : 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
        scrollX: 0,
        scrollY: 0
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add image to PDF (handle multiple pages if needed)
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Add watermark if specified
      if (options.watermark) {
        this.addWatermark(pdf, options.watermark);
      }

      // Download the PDF
      const fileName = `${cv.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_cv.pdf`;
      pdf.save(fileName);

      // Track download
      await import('../../lib/cv/cvService').then(({ default: CVService }) => {
        CVService.trackCVDownload(cv.id);
      });

    } catch (error) {
      console.error('Error exporting CV to PDF:', error);
      throw new Error('Failed to export CV to PDF');
    }
  }

  /**
   * Generate HTML content for PDF
   */
  private static generateHTMLContent(
    cv: CVProfile,
    options: CVExportOptions
  ): string {
    const personalInfo = cv.sections.find(s => s.type === 'personal-info')?.content.personalInfo;
    
    let html = `
      <div style="max-width: 100%; margin: 0 auto; background: white;">
        <!-- Header -->
        ${personalInfo ? this.generatePersonalInfoHTML(personalInfo, options) : ''}
        
        <!-- Sections -->
        ${cv.sections
          .filter(s => s.type !== 'personal-info' && s.isVisible)
          .sort((a, b) => a.order - b.order)
          .map(section => this.generateSectionHTML(section, options))
          .join('')}
      </div>
    `;

    return html;
  }

  /**
   * Generate personal info HTML
   */
  private static generatePersonalInfoHTML(personalInfo: any, options: CVExportOptions): string {
    return `
      <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #007bff;">
        <h1 style="font-size: 2.5rem; font-weight: 700; margin: 0 0 8px 0; color: #1a1a1a;">
          ${personalInfo.firstName} ${personalInfo.lastName}
        </h1>
        <h2 style="font-size: 1.3rem; font-weight: 400; margin: 0 0 16px 0; color: #007bff;">
          ${personalInfo.title}
        </h2>
        
        <div style="display: flex; flex-wrap: wrap; gap: 20px;">
          ${personalInfo.contact.email ? `
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.95rem; color: #495057;">
              <span>📧</span> ${personalInfo.contact.email}
            </div>
          ` : ''}
          
          ${personalInfo.contact.phone ? `
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.95rem; color: #495057;">
              <span>📱</span> ${personalInfo.contact.phone}
            </div>
          ` : ''}
          
          ${personalInfo.contact.address?.city ? `
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.95rem; color: #495057;">
              <span>📍</span> ${personalInfo.contact.address.city}
            </div>
          ` : ''}
          
          ${options.includeLinks && personalInfo.contact.website ? `
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.95rem; color: #495057;">
              <span>🌐</span> ${personalInfo.contact.website}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Generate section HTML
   */
  private static generateSectionHTML(section: any, options: CVExportOptions): string {
    return `
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 1.4rem; font-weight: 600; color: #1a1a1a; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 1px solid #dee2e6;">
          ${section.title}
        </h3>
        <div style="padding-left: 0;">
          ${this.generateSectionContentHTML(section, options)}
        </div>
      </div>
    `;
  }

  /**
   * Generate section content HTML
   */
  private static generateSectionContentHTML(section: any, options: CVExportOptions): string {
    switch (section.type) {
      case 'summary':
        return `
          <p style="font-size: 1rem; line-height: 1.6; color: #495057; margin: 0; text-align: justify;">
            ${section.content.summary?.content || ''}
          </p>
        `;

      case 'skills':
        return `
          <div style="display: flex; flex-wrap: wrap; gap: 12px;">
            ${(section.content.skills || []).map((skill: any) => `
              <div style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; font-size: 0.9rem;">
                <span style="font-weight: 500; color: #333;">${skill.name}</span>
                <span style="color: #6c757d; font-size: 0.8rem;">(${skill.level})</span>
              </div>
            `).join('')}
          </div>
        `;

      case 'experience':
        return `
          <div style="display: flex; flex-direction: column; gap: 20px;">
            ${(section.content.experience || []).map((exp: any) => `
              <div style="position: relative; padding-left: 20px; border-left: 3px solid #e9ecef;">
                <div style="position: absolute; left: -6px; top: 5px; width: 9px; height: 9px; background: #007bff; border-radius: 50%;"></div>
                <h4 style="font-size: 1.1rem; font-weight: 600; margin: 0 0 4px 0; color: #1a1a1a;">${exp.position}</h4>
                <div style="font-size: 1rem; font-weight: 500; color: #007bff; margin-bottom: 4px;">${exp.company}</div>
                <div style="font-size: 0.9rem; color: #6c757d; margin-bottom: 8px; font-style: italic;">
                  ${new Date(exp.startDate).toLocaleDateString()} - ${exp.isCurrent ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
                </div>
                <p style="font-size: 0.95rem; line-height: 1.5; color: #495057; margin: 0; text-align: justify;">${exp.description}</p>
              </div>
            `).join('')}
          </div>
        `;

      case 'education':
        return `
          <div style="display: flex; flex-direction: column; gap: 20px;">
            ${(section.content.education || []).map((edu: any) => `
              <div style="position: relative; padding-left: 20px; border-left: 3px solid #e9ecef;">
                <div style="position: absolute; left: -6px; top: 5px; width: 9px; height: 9px; background: #007bff; border-radius: 50%;"></div>
                <h4 style="font-size: 1.1rem; font-weight: 600; margin: 0 0 4px 0; color: #1a1a1a;">${edu.degree}</h4>
                <div style="font-size: 1rem; font-weight: 500; color: #007bff; margin-bottom: 4px;">${edu.institution}</div>
                <div style="font-size: 0.9rem; color: #6c757d; margin-bottom: 8px; font-style: italic;">
                  ${new Date(edu.startDate).toLocaleDateString()} - ${edu.isCurrent ? 'Present' : new Date(edu.endDate).toLocaleDateString()}
                </div>
              </div>
            `).join('')}
          </div>
        `;

      default:
        return `<p>Content for ${section.type} section</p>`;
    }
  }

  /**
   * Add watermark to PDF
   */
  private static addWatermark(
    pdf: jsPDF,
    watermark: { text: string; opacity: number; position: 'top' | 'bottom' | 'center' }
  ): void {
    const pageCount = pdf.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setGState(new pdf.GState({ opacity: watermark.opacity }));
      pdf.setFontSize(20);
      pdf.setTextColor(200, 200, 200);
      
      let y: number;
      switch (watermark.position) {
        case 'top':
          y = 30;
          break;
        case 'bottom':
          y = 280;
          break;
        case 'center':
        default:
          y = 150;
          break;
      }
      
      pdf.text(watermark.text, 105, y, { align: 'center' });
    }
  }

  /**
   * Export CV as HTML
   */
  static async exportToHTML(cv: CVProfile): Promise<void> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${cv.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f5f5f5; }
          .cv-container { max-width: 210mm; margin: 0 auto; background: white; padding: 20mm; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          h1 { font-size: 2.5em; margin: 0; color: #1a1a1a; }
          h2 { font-size: 1.3em; margin: 0; color: #007bff; }
          h3 { font-size: 1.4em; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 1px solid #dee2e6; }
          .header { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #007bff; }
          .section { margin-bottom: 30px; }
          .contact-info { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 16px; }
          .contact-item { display: flex; align-items: center; gap: 8px; }
          @media print { body { background: white; } .cv-container { box-shadow: none; padding: 0; } }
        </style>
      </head>
      <body>
        <div class="cv-container">
          ${this.generateHTMLContent(cv, { format: 'html', quality: 'high', includeImages: true, includeLinks: true })}
        </div>
      </body>
      </html>
    `;

    // Create and download HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cv.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_cv.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Print CV
   */
  static async printCV(cv: CVProfile): Promise<void> {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Unable to open print window');
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Print CV - ${cv.title}</title>
        <style>
          @page { margin: 20mm; }
          body { font-family: Arial, sans-serif; line-height: 1.5; color: #333; margin: 0; }
          h1 { font-size: 2.5em; margin: 0; }
          h2 { font-size: 1.3em; margin: 0; color: #007bff; }
          h3 { font-size: 1.4em; margin: 0 0 16px 0; border-bottom: 1px solid #ccc; padding-bottom: 8px; }
          .header { margin-bottom: 30px; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
          .section { margin-bottom: 30px; page-break-inside: avoid; }
          .contact-info { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 16px; }
          .no-print { display: none; }
        </style>
      </head>
      <body>
        ${this.generateHTMLContent(cv, { format: 'html', quality: 'high', includeImages: true, includeLinks: false })}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

export default CVExportService;
