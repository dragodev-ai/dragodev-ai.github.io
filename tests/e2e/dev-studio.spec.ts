import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const QA_SCREENSHOT_DIR =
  'C:/Users/Rishiii/.gemini/antigravity/brain/ae0c34c6-920a-4b5a-9e19-8d1e3fd04f07/scratch/qa_screenshots';

test.beforeAll(() => {
  fs.mkdirSync(QA_SCREENSHOT_DIR, { recursive: true });
});

test.describe('DEV STUDIO — Comprehensive Phase 18 End-to-End Journeys', () => {
  test('1. Showcase Video Hero (DEV_KUMAWAT_SAAS_WEB), Sound/Transport Controls & Navigation', async ({
    page,
  }, testInfo) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/');
    await expect(page).toHaveTitle(/Dev Kumawat/i);

    // Verify Showcase Video Hero stage & DEV_KUMAWAT_SAAS_WEB.mp4 element
    const heroStage = page.getByTestId('hero-video-stage');
    await expect(heroStage).toBeVisible({ timeout: 15_000 });

    const heroVideo = page.getByTestId('hero-showcase-video');
    await expect(heroVideo).toBeVisible();
    await expect(heroVideo).toHaveAttribute('src', '/videos/DEV_KUMAWAT_SAAS_WEB.mp4');

    // Verify default Audio + Video autoplay ON (and automatic first-interaction audio unlock if headless policy deferred audio)
    const soundToggle = page.getByTestId('hero-sound-toggle');
    await expect(soundToggle).toBeVisible();

    await page.waitForTimeout(800);

    // If strict fresh headless browser deferred audio until sticky user activation,
    // verify clicking anywhere on the page (without touching the sound button!) unlocks Sound On automatically
    const initialLabel = (await soundToggle.textContent()) || '';
    if (/Enable Sound/i.test(initialLabel)) {
      await page.locator('#hero').click({ position: { x: 8, y: 8 } });
    }
    await expect(soundToggle).toContainText(/Sound On/i);

    const isMobile = testInfo.project.name.includes('mobile');
    if (!isMobile) {
      await page.screenshot({
        path: path.join(QA_SCREENSHOT_DIR, '01-hero-video-showcase.png'),
      });
    } else {
      await page.screenshot({
        path: path.join(QA_SCREENSHOT_DIR, '09-mobile-hero-video.png'),
      });
    }

    // Verify manual mute/unmute toggle works cleanly
    await soundToggle.click();
    await expect(soundToggle).toContainText(/Enable Sound/i);
    await soundToggle.click();
    await expect(soundToggle).toContainText(/Sound On/i);

    // Verify play/pause & replay controls exist and operate cleanly
    const playToggle = page.getByTestId('hero-play-toggle');
    await expect(playToggle).toBeVisible();
    await expect(page.getByTestId('hero-restart-button')).toBeVisible();

    // Navigation verification (Desktop 3-column glass bar vs Mobile touch drawer)
    if (!isMobile) {
      const nav = page.getByRole('navigation', { name: /Primary Studio Navigation/i });
      await expect(nav.getByRole('link', { name: 'ABOUT' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'SERVICES' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'PRICE' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'PROJECTS' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'WORK ARCHIVE' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'CONTACT' })).toBeVisible();

      await nav.getByRole('link', { name: 'SERVICES' }).click();
      await expect(page).toHaveURL(/#services/);
    } else {
      const menuBtn = page.getByRole('button', { name: /Open navigation menu/i });
      await expect(menuBtn).toBeVisible();
      await menuBtn.click();
      await page.screenshot({
        path: path.join(QA_SCREENSHOT_DIR, '10-mobile-nav-drawer.png'),
      });
      const drawer = page.locator('#mobile-studio-nav');
      await expect(drawer.getByRole('link', { name: 'SERVICES' })).toBeVisible();
      await drawer.getByRole('link', { name: 'SERVICES' }).click();
      await expect(drawer).toBeHidden();
    }

    // Check zero horizontal overflow across viewport
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 2
    );
    expect(hasOverflow).toBe(false);
    expect(pageErrors).toEqual([]);
  });

  test('2. Client Brand Logos Marquee, About Me, Verified Resume PDF & Cinema Video Player Modal', async ({
    page,
    request,
  }, testInfo) => {
    await page.goto('/');
    await expect(page.getByTestId('hero-video-stage')).toBeVisible();

    // Verified Client Brand Logos Marquee (zero video thumbnails — pure brand logos only)
    const marqueeSection = page.getByTestId('portfolio-marquee-section');
    const rowLtr = page.getByTestId('marquee-row-ltr');
    const rowRtl = page.getByTestId('marquee-row-rtl');
    await marqueeSection.scrollIntoViewIfNeeded();
    await expect(marqueeSection).toBeVisible();
    await expect(rowLtr).toBeVisible();
    await expect(rowRtl).toBeVisible();
    await expect(marqueeSection.locator('img, video')).toHaveCount(0);
    await expect(marqueeSection).toContainText(/Chaayos/i);
    await expect(marqueeSection).toContainText(/Mahanagar Times/i);
    await expect(marqueeSection).toContainText(/AMITY/i);
    await expect(marqueeSection).toContainText(/DrDermX/i);

    if (!testInfo.project.name.includes('mobile')) {
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(QA_SCREENSHOT_DIR, '03-marquee-and-about.png'),
      });
    }

    // About Me section + verified credentials + Resume PDF HTTP check
    const aboutHeading = page.locator('#about-heading');
    await aboutHeading.scrollIntoViewIfNeeded();
    await expect(aboutHeading).toHaveText('ABOUT ME');
    await expect(page.locator('#about')).toContainText(/Jaipur/i);
    await expect(page.locator('#about')).toContainText(/Mahanagar Times/i);
    await expect(page.locator('#about')).toContainText(/Rajasthan University/i);

    const resumeBtn = page.getByTestId('resume-download-btn');
    await expect(resumeBtn).toBeVisible();
    const resumeHref = await resumeBtn.getAttribute('href');
    expect(resumeHref).toBe('/assets/Dev-Kumawat-Resume.pdf');

    const pdfRes = await request.get(resumeHref!);
    expect(pdfRes.status()).toBe(200);
    expect(pdfRes.headers()['content-type']).toContain('application/pdf');

    // Open Cinema Video Player Modal from Featured Project Card 0
    const stacked0 = page.getByTestId('stacked-project-card-0');
    await stacked0.scrollIntoViewIfNeeded();
    await stacked0.getByRole('button', { name: /WATCH PROOF/i }).click();

    const modal = page.getByTestId('cinema-player-modal');
    await expect(modal).toBeVisible();

    const videoEl = page.getByTestId('cinema-html5-video');
    if ((await videoEl.count()) > 0) {
      const src = await videoEl.getAttribute('src');
      expect(src).toMatch(/^\/api\/drive\/stream\//);
      await expect(page.getByTestId('cinema-play-toggle')).toBeVisible();
      await expect(page.getByTestId('cinema-seek-slider')).toBeVisible();
      await expect(page.getByTestId('cinema-fullscreen-btn')).toBeVisible();
    }

    if (!testInfo.project.name.includes('mobile')) {
      await page.waitForTimeout(1200);
      await page.screenshot({
        path: path.join(QA_SCREENSHOT_DIR, '06-cinema-player-modal.png'),
      });
    }

    await page.getByTestId('cinema-player-close').click();
    await expect(modal).toBeHidden();
  });

  test('3. White Editorial Services Sheet, Custom-Quote Pricing, Sticky Stacked Projects & Conversion Wiring', async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    await expect(page.getByTestId('hero-video-stage')).toBeVisible();

    // White Services Sheet (01 - 04)
    const servicesSheet = page.getByTestId('services-editorial-sheet');
    await servicesSheet.scrollIntoViewIfNeeded();
    await expect(servicesSheet).toBeVisible();
    await expect(page.getByTestId('service-panel-video-editing')).toBeVisible();

    if (!testInfo.project.name.includes('mobile')) {
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(QA_SCREENSHOT_DIR, '04-services-white-sheet.png'),
      });
    }

    // Expand 03 Motion Design and verify capabilities + Drive samples appear
    await page.getByTestId('service-row-btn-motion-design').click();
    await expect(page.getByTestId('service-panel-motion-design')).toBeVisible();
    await expect(page.getByTestId('service-panel-motion-design')).toContainText(
      /After Effects Motion Graphics/i
    );

    // Pricing section: verify non-fabricated Custom Quote & pre-selection in Contact form
    const retainerCard = page.getByTestId('pricing-card-monthly-social-retainer');
    await retainerCard.scrollIntoViewIfNeeded();
    await expect(retainerCard).toContainText("Custom Quote — Let's Discuss Your Project.");

    // Sticky Stacked Projects
    const stacked0 = page.getByTestId('stacked-project-card-0');
    await stacked0.scrollIntoViewIfNeeded();
    await expect(stacked0).toBeVisible();
    await expect(page.getByTestId('stacked-project-card-1')).toBeVisible();

    if (!testInfo.project.name.includes('mobile')) {
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(QA_SCREENSHOT_DIR, '05-pricing-and-stacked-projects.png'),
      });
    }

    // Click Pricing CTA -> must scroll/select "Monthly Social Media Package" in Contact service dropdown
    await retainerCard.scrollIntoViewIfNeeded();
    await page.getByTestId('pricing-cta-monthly-social-retainer').click();
    await expect(page.getByTestId('contact-service-select')).toHaveValue(
      'Monthly Social Media Package'
    );
  });

  test('4. Dedicated /work Portfolio Explorer: Real Drive Categories, Subfolders, Search & Layout Toggle', async ({
    page,
  }, testInfo) => {
    await page.goto('/work');
    await expect(
      page.getByRole('heading', { level: 1, name: /COMPLETE WORK ARCHIVE/i })
    ).toBeVisible();

    const explorer = page.getByTestId('portfolio-explorer');
    await expect(explorer).toBeVisible();

    // Filter by real Google Drive category "Graphics" and check real Drive subfolders appear
    const graphicsTab = page.getByTestId('category-filter-Graphics');
    await expect(graphicsTab).toBeVisible();
    await graphicsTab.click();
    await expect(page.getByRole('button', { name: 'FOOD', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'COMPANY banners', exact: true })).toBeVisible();

    // Filter by AI category
    await page.getByTestId('category-filter-AI- Artificial Intelligence').click();
    await expect(page.getByTestId('portfolio-grid').locator('button').first()).toBeVisible();

    // Reset to ALL and test instant search
    await page.getByTestId('category-filter-ALL').click();
    const searchInput = page.getByTestId('portfolio-search-input');
    await searchInput.fill('Podcast');
    await expect(page.getByTestId('portfolio-grid')).toContainText(/Podcast/i);
    await searchInput.fill('');

    // Toggle List / Grid view
    await page.getByTestId('layout-list-btn').click();
    await expect(page.getByTestId('portfolio-list')).toBeVisible();
    await page.getByTestId('layout-grid-btn').click();
    await expect(page.getByTestId('portfolio-grid')).toBeVisible();

    if (!testInfo.project.name.includes('mobile')) {
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(QA_SCREENSHOT_DIR, '07-work-archive-page.png'),
      });
    }
  });

  test('5. Contact Form Validation & Submission, Floating WhatsApp (+91 9309425465), IST Booking & Reduced Motion', async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/#contact');

    // Floating WhatsApp deep link check
    const waBtn = page.getByTestId('floating-whatsapp-btn');
    await expect(waBtn).toBeVisible();
    const waHref = await waBtn.getAttribute('href');
    expect(waHref).toContain('https://wa.me/919309425465?text=');

    // 1) Invalid Contact submission -> shows server validation message
    const contactForm = page.getByTestId('contact-enquiry-form');
    await contactForm.scrollIntoViewIfNeeded();
    await page.getByTestId('contact-submit-btn').click();
    await expect(page.getByTestId('contact-form-status')).toBeVisible();

    // 2) Valid Contact submission -> hits /api/contact cleanly (200 delivered if SMTP/Resend set, or transparent 503 fallback with mailto:kumawatrishi096@gmail.com)
    await page.locator('#contact-fullname').fill('Vikram Rathore');
    await page.locator('#contact-email').fill('vikram@jaipurfilmhouse.in');
    await page.locator('#contact-phone').fill('+91 9829011223');
    await page
      .locator('#contact-desc')
      .fill('We need commercial video editing and After Effects motion graphics for 3 ad films.');
    await page.getByTestId('contact-consent-checkbox').check();
    await page.getByTestId('contact-submit-btn').click();

    const contactStatus = page.getByTestId('contact-form-status');
    await expect(contactStatus).toBeVisible();
    await expect(contactStatus).toContainText(/kumawatrishi096@gmail.com/i);

    // 3) Book-a-Call (Asia/Kolkata IST) validation & submission
    const bookingSection = page.getByTestId('book-a-call-section');
    await expect(bookingSection).toContainText(/Asia\/Kolkata/i);

    const bookingForm = page.getByTestId('booking-request-form');
    await expect(bookingForm).toBeVisible();
    await page.locator('#book-name').fill('Ananya Singh');
    await page.locator('#book-email').fill('ananya@brandcraft.in');
    await page.locator('#book-phone').fill('+91 9810098100');
    await page.locator('#book-date').fill('2026-12-01');
    await page.getByTestId('booking-consent-checkbox').check();
    await page.getByTestId('booking-submit-btn').click();

    await expect(page.getByTestId('booking-form-status')).toBeVisible();

    if (!testInfo.project.name.includes('mobile')) {
      await page.screenshot({
        path: path.join(QA_SCREENSHOT_DIR, '08-contact-and-booking.png'),
      });
    }
  });
});
