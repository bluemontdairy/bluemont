import 'server-only';
import { getSiteMedia } from './siteMedia';
import { cldTransform } from './media';
import { renderEmail, renderText } from './emailTemplate';
import { getSiteInfo } from './siteSettings';

// Email images come from the site media slots (Admin → Site images), so a new
// logo or mascot shows up in emails too. Converted to PNG: Outlook and some
// webmail can't show WebP.
const emailImage = (img, width, siteUrl) => {
  if (!img) return '';
  if (img.uploaded) return cldTransform(img.src, `f_png,w_${width * 2},c_limit`);
  return `${siteUrl}${img.src}`;
};

/**
 * html + text for sendEmail(), from the same content (see emailTemplate.js).
 * `mascot` is a site media slot key, e.g. 'home.value-mascot'.
 */
export async function buildEmail({ mascot, ...content }) {
  const [media, info] = await Promise.all([getSiteMedia(), getSiteInfo()]);
  const html = renderEmail({
    ...content,
    legalName: info.legalName,
    contactEmail: info.email,
    instagram: info.socials.instagram,
    siteUrl: info.siteUrl,
    logoUrl: emailImage(media['logo.bluemont'], 78, info.siteUrl),
    mascotUrl: mascot ? emailImage(media[mascot], 150, info.siteUrl) : '',
  });
  return { html, text: renderText({ ...content, siteUrl: info.siteUrl }) };
}
