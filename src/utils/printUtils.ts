import jsPDF from 'jspdf';
import { PaymentRecord, HotelSettings, Booking, Guest, RestaurantOrder } from '../types/hotel';
import { formatINR, calculateGST, SAC_CODES } from './indiaUtils';

/**
 * Universal safe print runner using an isolated hidden iframe.
 * This guarantees that only the receipt/invoice is printed, with zero interference
 * from the app UI, background tables, sidebars, or scrollbars.
 */
export function printHtmlContent(htmlContent: string, documentTitle: string = 'Document') {
  try {
    const existingFrame = document.getElementById('app-print-frame');
    if (existingFrame) {
      existingFrame.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'app-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      throw new Error('Unable to access iframe document for printing');
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${documentTitle}</title>
          <style>
            @page {
              size: auto;
              margin: 8mm 12mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              margin: 0;
              padding: 0;
              font-size: 13px;
              line-height: 1.5;
            }
            .receipt-container {
              max-width: 480px;
              margin: 0 auto;
              padding: 24px;
              border: 1px solid #cbd5e1;
              border-radius: 16px;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 24px;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .uppercase { text-transform: uppercase; }
            .text-muted { color: #64748b; }
            .divider { border-top: 1px solid #e2e8f0; margin: 16px 0; }
            .divider-dashed { border-top: 1px dashed #cbd5e1; margin: 16px 0; }
            .badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 9999px;
              background: #ecfdf5;
              color: #047857;
              border: 1px solid #a7f3d0;
              font-weight: 700;
              font-size: 11px;
            }
            .amount-box {
              background: #f0fdf4;
              border: 1px solid #bbf7d0;
              border-radius: 12px;
              padding: 16px;
              text-align: center;
              margin: 16px 0;
            }
            .amount-val {
              font-size: 28px;
              font-weight: 800;
              color: #0f172a;
              margin: 4px 0;
            }
            .table-rows {
              width: 100%;
              border-collapse: collapse;
              margin: 12px 0;
            }
            .table-rows td {
              padding: 6px 0;
              border-bottom: 1px solid #f1f5f9;
            }
            .table-rows td:last-child {
              text-align: right;
              font-weight: 600;
            }
            .sign-img {
              max-height: 48px;
              max-width: 150px;
              object-fit: contain;
              margin-bottom: 4px;
            }
            .logo-img {
              width: 44px;
              height: 44px;
              border-radius: 10px;
              object-fit: cover;
              margin: 0 auto 8px auto;
              display: block;
              border: 1px solid #fcd34d;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.warn('Iframe print focus fallback', e);
        window.print();
      }
    }, 400);
  } catch (err) {
    console.error('Error during isolated printing, triggering standard print', err);
    window.print();
  }
}

/**
 * Generate receipt HTML structure for browser printing
 */
export function generateReceiptHTML(payment: PaymentRecord, settings: HotelSettings): string {
  return `
    <div class="receipt-container" style="background:#ffffff; border:1px solid #cbd5e1; border-radius:16px; padding:24px; max-width:480px; margin:0 auto; font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif; color:#0f172a;">
      <div style="text-align:center;">
        ${settings.logoUrl ? `<img src="${settings.logoUrl}" alt="Logo" style="width:48px; height:48px; border-radius:10px; object-fit:cover; margin:0 auto 8px auto; display:block; border:1px solid #fcd34d;" />` : ''}
        <h2 style="margin:0; font-size:18px; font-weight:800; text-transform:uppercase; color:#0f172a;">${settings.hotelName || 'AL-KAREEM'}</h2>
        <div style="font-size:11px; color:#64748b; margin-top:3px;">${settings.address || ''}, ${settings.city || ''}, ${settings.state || ''}</div>
        <div style="font-size:11px; color:#64748b;">GSTIN: ${settings.gstNumber || 'N/A'} • Contact: ${settings.mobile || ''}</div>
        <div style="margin-top:10px;">
          <span style="display:inline-block; padding:4px 12px; border-radius:9999px; background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; font-weight:700; font-size:11px;">
            OFFICIAL MONEY RECEIPT: ${payment.receiptNumber}
          </span>
        </div>
      </div>

      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:16px; text-align:center; margin:16px 0;">
        <div style="font-size:10px; text-transform:uppercase; font-weight:700; color:#047857; letter-spacing:0.5px;">Amount Received</div>
        <div style="font-size:28px; font-weight:800; color:#0f172a; margin:4px 0;">${formatINR(payment.amount)}</div>
        <div style="font-size:11px; color:#059669; font-weight:600;">Status: Paid & Credited</div>
      </div>

      <table style="width:100%; border-collapse:collapse; margin:12px 0; font-size:13px;">
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:6px 0; color:#64748b;">Received From:</td>
          <td style="padding:6px 0; text-align:right; font-weight:700; color:#0f172a;">${payment.guestName}</td>
        </tr>
        ${payment.roomNumber ? `
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:6px 0; color:#64748b;">Room Assigned:</td>
            <td style="padding:6px 0; text-align:right; font-weight:700; color:#4338ca;">Room #${payment.roomNumber}</td>
          </tr>
        ` : ''}
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:6px 0; color:#64748b;">Payment Category:</td>
          <td style="padding:6px 0; text-align:right; font-weight:600; color:#0f172a;">${payment.paymentType}</td>
        </tr>
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:6px 0; color:#64748b;">Payment Method:</td>
          <td style="padding:6px 0; text-align:right; font-weight:600; color:#0f172a;">${payment.paymentMethod}</td>
        </tr>
        ${payment.transactionRef ? `
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:6px 0; color:#64748b;">UTR / Transaction Ref:</td>
            <td style="padding:6px 0; text-align:right; font-family:monospace; font-weight:700; color:#0f172a;">${payment.transactionRef}</td>
          </tr>
        ` : ''}
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:6px 0; color:#64748b;">Date & Time:</td>
          <td style="padding:6px 0; text-align:right; font-weight:600; color:#0f172a;">${payment.date}</td>
        </tr>
        ${payment.notes ? `
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:6px 0; color:#64748b;">Note:</td>
            <td style="padding:6px 0; text-align:right; font-style:italic; color:#475569;">${payment.notes}</td>
          </tr>
        ` : ''}
      </table>

      <div style="border-top:1px dashed #cbd5e1; margin:16px 0;"></div>

      <div style="text-align:center; margin-top:20px; font-size:11px;">
        ${settings.signatureUrl ? `
          <img src="${settings.signatureUrl}" alt="Signature" style="max-height:48px; max-width:150px; object-fit:contain; margin:0 auto 4px auto; display:block;" />
          <div style="width:140px; border-bottom:1px solid #94a3b8; margin:0 auto 4px auto;"></div>
        ` : `
          <div style="width:140px; border-bottom:1px solid #94a3b8; margin:20px auto 4px auto;"></div>
        `}
        <div style="font-weight:700; color:#0f172a;">Authorized Signatory</div>
        <div style="font-size:10px; color:#475569;">${settings.signatoryTitle || 'S PATEL (General Manager)'}</div>
        <div style="font-size:10px; color:#94a3b8; margin-top:6px;">Thank you for staying at ${settings.hotelName || 'AL-KAREEM'}!</div>
      </div>
    </div>
  `;
}

/**
 * Print a clean Payment Receipt with full styling and signatures
 */
export function printReceipt(payment: PaymentRecord, settings: HotelSettings) {
  const receiptHtml = generateReceiptHTML(payment, settings);
  printHtmlContent(receiptHtml, `Receipt_${payment.receiptNumber}`);
}

/**
 * Helper to safely load an image URL as base64 string for jsPDF
 */
async function getBase64ImageFromUrl(imageUrl?: string): Promise<string | null> {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('data:image')) return imageUrl;
  try {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Direct Vector PDF generator for Payment Receipt.
 * Pure jsPDF - completely immune to oklch or CSS parser errors!
 */
export async function downloadReceiptPDF(payment: PaymentRecord, settings: HotelSettings): Promise<void> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 25;
    const cardWidth = pageWidth - margin * 2;
    let y = 25;

    // Outer receipt container box
    doc.setDrawColor(203, 213, 225); // #cbd5e1
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, y, cardWidth, 230, 4, 4, 'FD');

    // Header section
    let headerY = y + 12;

    // Optional Logo
    const logoData = await getBase64ImageFromUrl(settings.logoUrl);
    if (logoData) {
      try {
        doc.addImage(logoData, 'PNG', pageWidth / 2 - 8, headerY, 16, 16);
        headerY += 20;
      } catch {
        // Continue if logo fails
      }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // #0f172a
    doc.text((settings.hotelName || 'AL-KAREEM').toUpperCase(), pageWidth / 2, headerY, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // #64748b
    headerY += 5;
    const addr = `${settings.address || ''}, ${settings.city || ''}, ${settings.state || ''} ${settings.zipCode ? '- ' + settings.zipCode : ''}`;
    doc.text(addr, pageWidth / 2, headerY, { align: 'center' });

    headerY += 4.5;
    doc.text(`GSTIN: ${settings.gstNumber || 'N/A'}  •  Contact: ${settings.mobile || ''}`, pageWidth / 2, headerY, { align: 'center' });

    // Official receipt badge
    headerY += 8;
    const badgeText = `OFFICIAL MONEY RECEIPT: ${payment.receiptNumber}`;
    doc.setFillColor(236, 253, 245); // #ecfdf5
    doc.setDrawColor(167, 243, 208); // #a7f3d0
    doc.roundedRect(pageWidth / 2 - 45, headerY - 4, 90, 7.5, 3.5, 3.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(4, 120, 87); // #047857
    doc.text(badgeText, pageWidth / 2, headerY + 1, { align: 'center' });

    // Amount Paid Box
    headerY += 14;
    const boxX = margin + 10;
    const boxWidth = cardWidth - 20;
    doc.setFillColor(240, 253, 244); // #f0fdf4
    doc.setDrawColor(187, 247, 208); // #bbf7d0
    doc.roundedRect(boxX, headerY, boxWidth, 24, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(4, 120, 87);
    doc.text('AMOUNT RECEIVED', pageWidth / 2, headerY + 6, { align: 'center' });

    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(formatINR(payment.amount), pageWidth / 2, headerY + 14, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(5, 150, 105);
    doc.text('Status: Paid & Credited', pageWidth / 2, headerY + 20, { align: 'center' });

    // Table rows
    let rowY = headerY + 34;
    const leftX = margin + 12;
    const rightX = margin + cardWidth - 12;

    const rows: [string, string, boolean][] = [
      ['Received From:', payment.guestName, true],
      ...(payment.roomNumber ? [['Room Assigned:', `Room #${payment.roomNumber}`, true] as [string, string, boolean]] : []),
      ['Payment Category:', payment.paymentType, false],
      ['Payment Method:', payment.paymentMethod, false],
      ...(payment.transactionRef ? [['UTR / Transaction Ref:', payment.transactionRef, true] as [string, string, boolean]] : []),
      ['Date & Time:', payment.date, false],
      ...(payment.notes ? [['Note:', payment.notes, false] as [string, string, boolean]] : [])
    ];

    rows.forEach(([label, val, isBold]) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text(label, leftX, rowY);

      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(val, rightX, rowY, { align: 'right' });

      // subtle row border
      doc.setDrawColor(241, 245, 249);
      doc.line(leftX, rowY + 2.5, rightX, rowY + 2.5);
      rowY += 9;
    });

    // Dashed divider
    rowY += 4;
    doc.setDrawColor(203, 213, 225);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(leftX, rowY, rightX, rowY);
    doc.setLineDashPattern([], 0); // reset dash

    // Signature section
    rowY += 8;
    const sigData = await getBase64ImageFromUrl(settings.signatureUrl);
    if (sigData) {
      try {
        doc.addImage(sigData, 'PNG', pageWidth / 2 - 20, rowY, 40, 12);
        rowY += 13;
      } catch {
        rowY += 10;
      }
    } else {
      rowY += 10;
    }

    doc.setDrawColor(148, 163, 184);
    doc.line(pageWidth / 2 - 25, rowY, pageWidth / 2 + 25, rowY);

    rowY += 4.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Authorized Signatory', pageWidth / 2, rowY, { align: 'center' });

    rowY += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const signatory = payment.createdByName || settings.signatoryTitle || 'S PATEL (General Manager)';
    doc.text(signatory, pageWidth / 2, rowY, { align: 'center' });

    rowY += 4;
    doc.setTextColor(148, 163, 184);
    doc.text(`Thank you for staying at ${settings.hotelName || 'AL-KAREEM'}!`, pageWidth / 2, rowY, { align: 'center' });

    const safeHotel = (settings.hotelName || 'AL-KAREEM').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`${safeHotel}_Receipt_${payment.receiptNumber}.pdf`);
  } catch (err) {
    console.error('Vector PDF generation error:', err);
    printReceipt(payment, settings);
  }
}

/**
 * Generate GST Tax Invoice HTML for browser printing
 */
export function generateInvoiceHTML(
  booking: Booking,
  guest: Guest | undefined,
  settings: HotelSettings,
  relatedPayments: PaymentRecord[],
  relatedOrders: RestaurantOrder[]
): string {
  const invoiceNum = `${settings.invoicePrefix || 'INV-2026-'}${booking.bookingId.replace(/[^0-9]/g, '') || '101'}`;
  const isInterState = Boolean(guest?.state && settings.state && guest.state.toLowerCase() !== settings.state.toLowerCase());
  const taxableSubtotal = booking.roomCharges + booking.extraCharges - booking.discount;
  const gstBreakdown = calculateGST(taxableSubtotal, settings.taxPercentage || 12, isInterState);
  const totalPaid = relatedPayments.reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = booking.grandTotal - totalPaid;

  return `
    <div class="invoice-container" style="background:#ffffff; max-width:800px; margin:0 auto; padding:24px; font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif; color:#0f172a;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #0f172a; padding-bottom:16px;">
        <div>
          ${settings.logoUrl ? `<img src="${settings.logoUrl}" alt="Logo" style="width:50px; height:50px; border-radius:12px; object-fit:cover; margin-bottom:8px; display:block;" />` : ''}
          <h1 style="margin:0; font-size:24px; font-weight:800; text-transform:uppercase; color:#0f172a;">${settings.hotelName || 'AL-KAREEM'}</h1>
          <div style="font-size:12px; color:#64748b;">${settings.tagline || 'Luxury Indian Hospitality & Comfort'}</div>
          <div style="font-size:12px; color:#334155; margin-top:4px;">${settings.address}, ${settings.city}, ${settings.state} - ${settings.zipCode}</div>
          <div style="font-size:12px; color:#334155;"><strong>GSTIN:</strong> ${settings.gstNumber} | <strong>PAN:</strong> ${settings.panNumber || 'N/A'}</div>
          <div style="font-size:12px; color:#334155;"><strong>Phone:</strong> ${settings.mobile} | <strong>Email:</strong> ${settings.email}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:20px; font-weight:800; color:#4338ca;">TAX INVOICE</div>
          <div style="font-size:13px; font-weight:700; margin-top:4px;">Invoice No: <span style="font-family:monospace;">${invoiceNum}</span></div>
          <div style="font-size:12px; color:#64748b;">Booking ID: ${booking.bookingId}</div>
          <div style="font-size:12px; color:#64748b;">Date: ${new Date().toLocaleDateString('en-IN')}</div>
          <div style="margin-top:8px;">
            <span style="padding:4px 10px; border-radius:8px; background:#e0e7ff; color:#3730a3; font-weight:700; font-size:11px; display:inline-block;">
              SAC CODE: ${SAC_CODES.ROOM_ACCOMMODATION.code}
            </span>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin:20px 0; background:#f8fafc; padding:16px; border-radius:12px;">
        <div>
          <div style="font-size:11px; text-transform:uppercase; font-weight:700; color:#64748b;">Billed To (Guest Details):</div>
          <div style="font-size:15px; font-weight:800; color:#0f172a; margin-top:2px;">${booking.guestName}</div>
          <div style="font-size:12px; color:#475569;">Mobile: ${guest?.mobile || booking.mobile || 'N/A'}</div>
          <div style="font-size:12px; color:#475569;">State / Place of Supply: ${guest?.state || settings.state || 'Maharashtra'}</div>
          ${guest?.gstin ? `<div style="font-size:12px; color:#0f172a; font-weight:600;">Guest GSTIN: ${guest.gstin}</div>` : ''}
        </div>
        <div>
          <div style="font-size:11px; text-transform:uppercase; font-weight:700; color:#64748b;">Stay Details:</div>
          <div style="font-size:13px; font-weight:700; color:#0f172a;">Room #${booking.roomNumber} (${booking.roomTypeName})</div>
          <div style="font-size:12px; color:#475569;">Check-In: <strong>${booking.checkInDate}</strong> | Check-Out: <strong>${booking.checkOutDate}</strong></div>
          <div style="font-size:12px; color:#475569;">Duration: <strong>${booking.nights} Night(s)</strong> | Guests: ${booking.adults} Adults, ${booking.children} Child</div>
        </div>
      </div>

      <table style="width:100%; border-collapse:collapse; margin:20px 0; font-size:12px;">
        <thead>
          <tr style="background:#0f172a; color:white;">
            <th style="padding:8px 12px; text-align:left;">#</th>
            <th style="padding:8px 12px; text-align:left;">Description</th>
            <th style="padding:8px 12px; text-align:center;">SAC / HSN</th>
            <th style="padding:8px 12px; text-align:center;">Rate</th>
            <th style="padding:8px 12px; text-align:center;">Qty</th>
            <th style="padding:8px 12px; text-align:right;">Taxable Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:8px 12px;">1</td>
            <td style="padding:8px 12px;">
              <strong>Room Tariff - ${booking.roomTypeName}</strong>
              <div style="font-size:10px; color:#64748b;">Stay for Room #${booking.roomNumber}</div>
            </td>
            <td style="padding:8px 12px; text-align:center;">${SAC_CODES.ROOM_ACCOMMODATION.code}</td>
            <td style="padding:8px 12px; text-align:center;">${formatINR(booking.roomRate)}</td>
            <td style="padding:8px 12px; text-align:center;">${booking.nights} Night(s)</td>
            <td style="padding:8px 12px; text-align:right; font-weight:700;">${formatINR(booking.roomCharges)}</td>
          </tr>
          ${booking.extraCharges > 0 ? `
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:8px 12px;">2</td>
              <td style="padding:8px 12px;"><strong>Extra Amenities & Room Services</strong></td>
              <td style="padding:8px 12px; text-align:center;">${SAC_CODES.OTHER_SERVICES.code}</td>
              <td style="padding:8px 12px; text-align:center;">${formatINR(booking.extraCharges)}</td>
              <td style="padding:8px 12px; text-align:center;">1</td>
              <td style="padding:8px 12px; text-align:right; font-weight:700;">${formatINR(booking.extraCharges)}</td>
            </tr>
          ` : ''}
          ${relatedOrders.length > 0 ? relatedOrders.map((ord, idx) => `
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:8px 12px;">${idx + 3}</td>
              <td style="padding:8px 12px;"><strong>Restaurant Dining / Room Service</strong> (${ord.orderNumber})</td>
              <td style="padding:8px 12px; text-align:center;">${SAC_CODES.FOOD_RESTAURANT.code}</td>
              <td style="padding:8px 12px; text-align:center;">-</td>
              <td style="padding:8px 12px; text-align:center;">${ord.items.length} item(s)</td>
              <td style="padding:8px 12px; text-align:right; font-weight:700;">${formatINR(ord.subtotal)}</td>
            </tr>
          `).join('') : ''}
        </tbody>
      </table>

      <div style="display:flex; justify-content:flex-end; margin-top:10px;">
        <div style="width:320px; font-size:12px;">
          <div style="display:flex; justify-content:space-between; padding:4px 0;">
            <span>Subtotal (Taxable):</span>
            <span style="font-weight:600;">${formatINR(taxableSubtotal)}</span>
          </div>
          ${booking.discount > 0 ? `
            <div style="display:flex; justify-content:space-between; padding:4px 0; color:#dc2626;">
              <span>Discount Allowed:</span>
              <span>- ${formatINR(booking.discount)}</span>
            </div>
          ` : ''}
          ${isInterState ? `
            <div style="display:flex; justify-content:space-between; padding:4px 0;">
              <span>IGST (${gstBreakdown.igstRate}%):</span>
              <span style="font-weight:600;">${formatINR(gstBreakdown.igstAmount)}</span>
            </div>
          ` : `
            <div style="display:flex; justify-content:space-between; padding:4px 0;">
              <span>CGST (${gstBreakdown.cgstRate}%):</span>
              <span style="font-weight:600;">${formatINR(gstBreakdown.cgstAmount)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; padding:4px 0;">
              <span>SGST (${gstBreakdown.sgstRate}%):</span>
              <span style="font-weight:600;">${formatINR(gstBreakdown.sgstAmount)}</span>
            </div>
          `}
          <div style="display:flex; justify-content:space-between; padding:8px 0; border-top:2px solid #0f172a; border-bottom:2px solid #0f172a; margin-top:4px; font-size:15px; font-weight:800;">
            <span>Grand Total (INR):</span>
            <span style="color:#4338ca;">${formatINR(booking.grandTotal)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:4px 0; color:#059669; font-weight:600; margin-top:4px;">
            <span>Total Paid Amount:</span>
            <span>${formatINR(totalPaid)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:4px 0; color:${balanceDue > 0 ? '#dc2626' : '#059669'}; font-weight:700;">
            <span>Balance Outstanding:</span>
            <span>${formatINR(balanceDue)}</span>
          </div>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:40px; border-top:1px solid #cbd5e1; padding-top:20px;">
        <div style="max-width:400px; font-size:10px; color:#64748b;">
          <strong>Terms & Conditions:</strong>
          <div>${settings.termsAndConditions || 'Government photo ID mandatory at check-in. Standard checkout is 11:00 AM. Computer generated invoice.'}</div>
        </div>
        <div style="text-align:center; min-width:180px;">
          ${settings.signatureUrl ? `
            <img src="${settings.signatureUrl}" alt="Signature" class="sign-img" style="max-height:52px; display:block; margin:0 auto;" />
            <div style="width:160px; border-bottom:1px solid #0f172a; margin:2px auto 4px auto;"></div>
          ` : `
            <div style="width:160px; border-bottom:1px solid #0f172a; margin:30px auto 4px auto;"></div>
          `}
          <div style="font-weight:800; font-size:11px;">Authorized Signatory</div>
          <div style="font-size:10px; color:#475569;">${settings.signatoryTitle || 'S PATEL (General Manager)'}</div>
          <div style="font-size:9px; color:#94a3b8; text-transform:uppercase;">${settings.hotelName}</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Print a clean GST Tax Invoice
 */
export function printInvoice(
  booking: Booking,
  guest: Guest | undefined,
  settings: HotelSettings,
  relatedPayments: PaymentRecord[],
  relatedOrders: RestaurantOrder[]
) {
  const invoiceNum = `${settings.invoicePrefix || 'INV-2026-'}${booking.bookingId.replace(/[^0-9]/g, '') || '101'}`;
  const invoiceHtml = generateInvoiceHTML(booking, guest, settings, relatedPayments, relatedOrders);
  printHtmlContent(invoiceHtml, `Invoice_${invoiceNum}`);
}

/**
 * Direct Vector PDF generator for GST Tax Invoice.
 * Pure jsPDF - completely immune to oklch or CSS parser errors!
 */
export async function downloadInvoicePDF(
  booking: Booking,
  guest: Guest | undefined,
  settings: HotelSettings,
  relatedPayments: PaymentRecord[],
  relatedOrders: RestaurantOrder[]
): Promise<void> {
  try {
    const invoiceNum = `${settings.invoicePrefix || 'INV-2026-'}${booking.bookingId.replace(/[^0-9]/g, '') || '101'}`;
    const isInterState = Boolean(guest?.state && settings.state && guest.state.toLowerCase() !== settings.state.toLowerCase());
    const taxableSubtotal = booking.roomCharges + booking.extraCharges - booking.discount;
    const gstBreakdown = calculateGST(taxableSubtotal, settings.taxPercentage || 12, isInterState);
    const totalPaid = relatedPayments.reduce((sum, p) => sum + p.amount, 0);
    const balanceDue = booking.grandTotal - totalPaid;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let y = 18;

    // Header: Hotel info on left, Invoice title on right
    let leftY = y;
    const logoData = await getBase64ImageFromUrl(settings.logoUrl);
    if (logoData) {
      try {
        doc.addImage(logoData, 'PNG', margin, leftY, 14, 14);
        leftY += 16;
      } catch {
        // Continue
      }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // #0f172a
    doc.text((settings.hotelName || 'AL-KAREEM').toUpperCase(), margin, leftY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    leftY += 4.5;
    doc.text(settings.tagline || 'Luxury Indian Hospitality & Comfort', margin, leftY);

    doc.setTextColor(51, 65, 85);
    leftY += 4;
    doc.text(`${settings.address}, ${settings.city}, ${settings.state} - ${settings.zipCode}`, margin, leftY);
    leftY += 4;
    doc.text(`GSTIN: ${settings.gstNumber}  |  PAN: ${settings.panNumber || 'N/A'}`, margin, leftY);
    leftY += 4;
    doc.text(`Phone: ${settings.mobile}  |  Email: ${settings.email}`, margin, leftY);

    // Right Header: TAX INVOICE
    let rightY = y + 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(67, 56, 202); // #4338ca
    doc.text('TAX INVOICE', margin + contentWidth, rightY, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    rightY += 6;
    doc.text(`Invoice No: ${invoiceNum}`, margin + contentWidth, rightY, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    rightY += 4.5;
    doc.text(`Booking ID: ${booking.bookingId}`, margin + contentWidth, rightY, { align: 'right' });
    rightY += 4;
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, margin + contentWidth, rightY, { align: 'right' });

    // SAC Code badge on right
    rightY += 5;
    doc.setFillColor(224, 231, 255);
    doc.roundedRect(margin + contentWidth - 45, rightY - 3, 45, 6, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(55, 48, 163);
    doc.text(`SAC: ${SAC_CODES.ROOM_ACCOMMODATION.code}`, margin + contentWidth - 22.5, rightY + 1.2, { align: 'center' });

    // Divider
    y = Math.max(leftY, rightY) + 8;
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.6);
    doc.line(margin, y, margin + contentWidth, y);
    doc.setLineWidth(0.2); // reset line width

    // Info section: 2 columns (Billed To & Stay Details)
    y += 5;
    const colWidth = (contentWidth - 6) / 2;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'FD');

    // Left column: Guest Info
    let guestY = y + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('BILLED TO (GUEST DETAILS):', margin + 4, guestY);

    guestY += 4.5;
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(booking.guestName, margin + 4, guestY);

    guestY += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Mobile: ${guest?.mobile || booking.mobile || 'N/A'}`, margin + 4, guestY);
    guestY += 3.8;
    doc.text(`State / Place of Supply: ${guest?.state || settings.state || 'Maharashtra'}`, margin + 4, guestY);
    if (guest?.gstin) {
      guestY += 3.8;
      doc.setFont('helvetica', 'bold');
      doc.text(`Guest GSTIN: ${guest.gstin}`, margin + 4, guestY);
    }

    // Right column: Stay Details
    let stayY = y + 5;
    const stayLeft = margin + colWidth + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('STAY & RESERVATION DETAILS:', stayLeft, stayY);

    stayY += 4.5;
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Room #${booking.roomNumber} (${booking.roomTypeName})`, stayLeft, stayY);

    stayY += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Check-In: ${booking.checkInDate}  |  Check-Out: ${booking.checkOutDate}`, stayLeft, stayY);
    stayY += 3.8;
    doc.text(`Duration: ${booking.nights} Night(s)  |  Guests: ${booking.adults} Adults, ${booking.children} Child`, stayLeft, stayY);

    // Items Table
    y += 32;
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, contentWidth, 7.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('#', margin + 3, y + 5);
    doc.text('Description', margin + 12, y + 5);
    doc.text('SAC / HSN', margin + 85, y + 5, { align: 'center' });
    doc.text('Rate', margin + 115, y + 5, { align: 'center' });
    doc.text('Qty', margin + 140, y + 5, { align: 'center' });
    doc.text('Taxable Amount', margin + contentWidth - 3, y + 5, { align: 'right' });

    y += 7.5;

    // Table rows
    interface TableItem {
      idx: number;
      desc: string;
      sub: string;
      sac: string;
      rate: string;
      qty: string;
      amount: number;
    }

    const items: TableItem[] = [
      {
        idx: 1,
        desc: `Room Tariff - ${booking.roomTypeName}`,
        sub: `Stay for Room #${booking.roomNumber}`,
        sac: SAC_CODES.ROOM_ACCOMMODATION.code,
        rate: formatINR(booking.roomRate),
        qty: `${booking.nights} Night(s)`,
        amount: booking.roomCharges
      }
    ];

    if (booking.extraCharges > 0) {
      items.push({
        idx: items.length + 1,
        desc: 'Extra Amenities & Room Services',
        sub: 'Service add-ons',
        sac: SAC_CODES.OTHER_SERVICES.code,
        rate: formatINR(booking.extraCharges),
        qty: '1',
        amount: booking.extraCharges
      });
    }

    relatedOrders.forEach((ord) => {
      items.push({
        idx: items.length + 1,
        desc: `Restaurant Dining (${ord.orderNumber})`,
        sub: `${ord.items.length} order items`,
        sac: SAC_CODES.FOOD_RESTAURANT.code,
        rate: '-',
        qty: `${ord.items.length}`,
        amount: ord.subtotal
      });
    });

    items.forEach((item) => {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, 10, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(item.idx.toString(), margin + 3, y + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.text(item.desc, margin + 12, y + 4.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(item.sub, margin + 12, y + 8);

      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(item.sac, margin + 85, y + 5.5, { align: 'center' });
      doc.text(item.rate, margin + 115, y + 5.5, { align: 'center' });
      doc.text(item.qty, margin + 140, y + 5.5, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.text(formatINR(item.amount), margin + contentWidth - 3, y + 5.5, { align: 'right' });

      y += 10;
    });

    // Summary calculation block on right
    y += 6;
    const summaryWidth = 80;
    const sumX = margin + contentWidth - summaryWidth;
    const valX = margin + contentWidth;

    const calcRows: [string, string, string, boolean][] = [
      ['Subtotal (Taxable):', formatINR(taxableSubtotal), '#0f172a', false],
      ...(booking.discount > 0 ? [['Discount Allowed:', `- ${formatINR(booking.discount)}`, '#dc2626', false] as [string, string, string, boolean]] : []),
      ...(isInterState
        ? [[`IGST (${gstBreakdown.igstRate}%):`, formatINR(gstBreakdown.igstAmount), '#0f172a', false] as [string, string, string, boolean]]
        : [
            [`CGST (${gstBreakdown.cgstRate}%):`, formatINR(gstBreakdown.cgstAmount), '#0f172a', false] as [string, string, string, boolean],
            [`SGST (${gstBreakdown.sgstRate}%):`, formatINR(gstBreakdown.sgstAmount), '#0f172a', false] as [string, string, string, boolean]
          ]),
      ['Grand Total (INR):', formatINR(booking.grandTotal), '#4338ca', true],
      ['Total Paid Amount:', formatINR(totalPaid), '#059669', false],
      ['Balance Outstanding:', formatINR(balanceDue), balanceDue > 0 ? '#dc2626' : '#059669', true]
    ];

    calcRows.forEach(([label, val, color, isBig]) => {
      doc.setFont('helvetica', isBig ? 'bold' : 'normal');
      doc.setFontSize(isBig ? 9.5 : 8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(label, sumX, y);

      doc.setFont('helvetica', 'bold');
      if (color === '#dc2626') doc.setTextColor(220, 38, 38);
      else if (color === '#059669') doc.setTextColor(5, 150, 105);
      else if (color === '#4338ca') doc.setTextColor(67, 56, 202);
      else doc.setTextColor(15, 23, 42);

      doc.text(val, valX, y, { align: 'right' });

      if (isBig && label.includes('Grand Total')) {
        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(0.4);
        doc.line(sumX, y - 4, valX, y - 4);
        doc.line(sumX, y + 2, valX, y + 2);
        doc.setLineWidth(0.2);
        y += 7;
      } else {
        y += 5;
      }
    });

    // Terms and Signatory footer
    y = Math.max(y + 8, 245);
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y, margin + contentWidth, y);

    y += 5;
    // Left: Terms
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('TERMS & CONDITIONS:', margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const terms = settings.termsAndConditions || 'Government photo ID mandatory at check-in. Standard checkout is 11:00 AM. Computer generated invoice.';
    doc.text(doc.splitTextToSize(terms, 100), margin, y + 4);

    // Right: Authorized Signatory
    const sigX = margin + contentWidth - 35;
    let sigY = y;
    const sigData = await getBase64ImageFromUrl(settings.signatureUrl);
    if (sigData) {
      try {
        doc.addImage(sigData, 'PNG', sigX - 18, sigY - 2, 36, 10);
        sigY += 9;
      } catch {
        sigY += 8;
      }
    } else {
      sigY += 8;
    }

    doc.setDrawColor(15, 23, 42);
    doc.line(sigX - 20, sigY, sigX + 20, sigY);

    sigY += 3.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('Authorized Signatory', sigX, sigY, { align: 'center' });

    sigY += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(settings.signatoryTitle || 'S PATEL (General Manager)', sigX, sigY, { align: 'center' });

    sigY += 3;
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text((settings.hotelName || 'AL-KAREEM').toUpperCase(), sigX, sigY, { align: 'center' });

    const safeHotel = (settings.hotelName || 'AL-KAREEM').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`${safeHotel}_TaxInvoice_${invoiceNum}.pdf`);
  } catch (err) {
    console.error('Invoice PDF error:', err);
    printInvoice(booking, guest, settings, relatedPayments, relatedOrders);
  }
}
