// Renders the list of friends who haven't contributed to an event yet as a downloadable PNG image.

const COLORS = {
  bg: '#FFFFFF',
  header: '#6C63FF',
  headerText: '#FFFFFF',
  rowAlt: '#EEECFF',
  text: '#1A1B25',
  meta: '#6E7191',
  footer: '#A0A3BD',
};

function wrapDate(date, lang) {
  return new Date(date).toLocaleDateString(lang === 'ar' ? 'ar' : lang === 'fr' ? 'fr' : 'en', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export function downloadUnpaidFriendsPng({ event, names, lang, labels }) {
  const isRtl = lang === 'ar';
  const width = 720;
  const rowHeight = 54;
  const headerHeight = 130;
  const footerHeight = 50;
  const height = headerHeight + Math.max(names.length, 1) * rowHeight + footerHeight;

  const canvas = document.createElement('canvas');
  const scale = 2; // sharper output
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.direction = isRtl ? 'rtl' : 'ltr';
  ctx.textBaseline = 'middle';

  // Background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, width, height);

  // Header
  ctx.fillStyle = COLORS.header;
  ctx.fillRect(0, 0, width, headerHeight);
  ctx.fillStyle = COLORS.headerText;
  ctx.font = '700 24px Tahoma, Arial, sans-serif';
  ctx.textAlign = isRtl ? 'right' : 'left';
  ctx.fillText(labels.title, isRtl ? width - 24 : 24, 44);
  ctx.font = '400 15px Tahoma, Arial, sans-serif';
  ctx.fillText(`${event.title} · ${wrapDate(event.eventDate, lang)}`, isRtl ? width - 24 : 24, 76);
  ctx.font = '600 15px Tahoma, Arial, sans-serif';
  ctx.fillText(`${labels.count}: ${names.length}`, isRtl ? width - 24 : 24, 104);

  // Rows
  names.forEach((name, i) => {
    const y = headerHeight + i * rowHeight;
    if (i % 2 === 1) {
      ctx.fillStyle = COLORS.rowAlt;
      ctx.fillRect(0, y, width, rowHeight);
    }
    ctx.fillStyle = COLORS.meta;
    ctx.font = '400 14px Tahoma, Arial, sans-serif';
    ctx.textAlign = isRtl ? 'left' : 'right';
    ctx.fillText(String(i + 1), isRtl ? 24 : width - 24, y + rowHeight / 2);

    ctx.fillStyle = COLORS.text;
    ctx.font = '600 18px Tahoma, Arial, sans-serif';
    ctx.textAlign = isRtl ? 'right' : 'left';
    ctx.fillText(name, isRtl ? width - 56 : 56, y + rowHeight / 2);
  });

  if (names.length === 0) {
    ctx.fillStyle = COLORS.meta;
    ctx.font = '400 16px Tahoma, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labels.empty, width / 2, headerHeight + rowHeight / 2);
  }

  // Footer
  ctx.fillStyle = COLORS.footer;
  ctx.font = '400 12px Tahoma, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(labels.footer, width / 2, height - footerHeight / 2);

  const link = document.createElement('a');
  const safeTitle = (event.title || 'event').replace(/[^\p{L}\p{N}_-]+/gu, '_');
  link.download = `${labels.filePrefix}_${safeTitle}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
