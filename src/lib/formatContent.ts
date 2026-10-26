/**
 * Utility functions for cleaning, formatting, and sanitizing product descriptions,
 * benefits, and specifications across NutriFitness.ch.
 * 
 * Fixes literal escape sequences (e.g. \n, \\n, \r\n, n//) and ensures
 * HTML tags (like <strong>, <ul>, <li>, <br>) render properly without exposing raw code.
 */

/**
 * Transforms product text/HTML into clean, valid HTML ready for dangerouslySetInnerHTML.
 * - Replaces literal \n, \\n, \r\n, n// with clean line breaks or paragraph tags.
 * - Parses and renders HTML tags like <strong>, <b>, <ul>, <li>, <p> cleanly.
 * - Eliminates stray \n text artifacts completely.
 */
export function sanitizeProductHtml(rawText: string | null | undefined): string {
  if (!rawText) return '';

  let text = String(rawText);

  // 1. Unescape literal backslash escape strings and corrupted newline artifacts
  text = text
    .replace(/\\\\r\\\\n/g, '\n')
    .replace(/\\\\n/g, '\n')
    .replace(/\\\\r/g, '\n')
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/(^|\s)n\/\/(\s|$)/gi, '$1<br />$2')
    .replace(/(^|\s)\/n\/(\s|$)/gi, '$1<br />$2');

  // 2. Remove any remaining isolated literal "\n" strings surrounded by whitespace or tags
  text = text
    .replace(/>\s*\\n\s*</g, '><br /><')
    .replace(/>\s*\\n\s*/g, '><br />')
    .replace(/\s*\\n\s*</g, '<br /><')
    .replace(/(^|\s)\\n(\s|$)/g, '$1<br />$2');

  // 3. Check if text already contains block-level HTML tags
  const hasBlockTags = /<(p|div|ul|ol|li|h1|h2|h3|h4|h5|h6|table|blockquote)[\s>]/i.test(text);

  if (!hasBlockTags) {
    // If text is inline or list of bullet points with newlines:
    const paragraphs = text.split(/\n\s*\n/);
    return paragraphs
      .map(para => para.trim())
      .filter(Boolean)
      .map(para => {
        const lines = para.split('\n').map(l => l.trim()).filter(Boolean);
        return `<p>${lines.join('<br />')}</p>`;
      })
      .join('');
  } else {
    // If text already has block tags:
    // Convert newlines between text to <br /> or clean space
    text = text.replace(/\n{2,}/g, '<br /><br />').replace(/\n/g, '<br />');
    // Clean redundant <br /> directly following opening or preceding closing block tags
    text = text
      .replace(/<(p|div|li|h[1-6])>\s*<br\s*\/?>/gi, '<$1>')
      .replace(/<br\s*\/?>\s*<\/(p|div|li|h[1-6])>/gi, '</$1>')
      .replace(/(<br\s*\/?>){3,}/gi, '<br /><br />');
    return text;
  }
}

/**
 * Strips all HTML tags and escape artifacts to produce clean plain text for SEO meta tags,
 * schemas, and card summaries.
 */
export function stripHtmlAndEscapes(rawText: string | null | undefined): string {
  if (!rawText) return '';
  return String(rawText)
    .replace(/\\\\r\\\\n/g, ' ')
    .replace(/\\\\n/g, ' ')
    .replace(/\\\\r/g, ' ')
    .replace(/\\r\\n/g, ' ')
    .replace(/\\n/g, ' ')
    .replace(/\\r/g, ' ')
    .replace(/\r\n/g, ' ')
    .replace(/[\r\n]+/g, ' ')
    .replace(/n\/\//gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Unescapes literal backslash sequences into real line breaks for textareas and edit inputs.
 */
export function unescapeText(rawText: string | null | undefined): string {
  if (!rawText) return '';
  return String(rawText)
    .replace(/\\\\r\\\\n/g, '\n')
    .replace(/\\\\n/g, '\n')
    .replace(/\\\\r/g, '\n')
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/(^|\s)n\/\/(\s|$)/gi, '$1\n$2')
    .replace(/(^|\s)\/n\/(\s|$)/gi, '$1\n$2');
}
