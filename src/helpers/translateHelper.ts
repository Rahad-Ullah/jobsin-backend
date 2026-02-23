import translate from '../config/google-translate';

/**
 * Reusable HTML Translation Function
 * @param {string} html - The HTML string to translate
 * @param {string} targetLanguage - ISO 639-1 code (e.g., 'es', 'fr', 'ar')
 * @returns {Promise<string>} - Translated HTML
 */
const translateHTML = async (
  html: string,
  targetLanguage: string,
): Promise<string> => {
  try {
    const [translation] = await translate.translate(html, {
      to: targetLanguage,
      format: 'html', // This protects your tags!
    });

    return translation;
  } catch (error: any) {
    console.error('Translation Error:', error.message);
    // Fallback: return original text if translation fails
    return html;
  }
};

export const translateHelper = { translateHTML };
