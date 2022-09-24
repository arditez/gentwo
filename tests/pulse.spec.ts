import { test, expect, type Page } from '@playwright/test';

const searchSVGPath = 'M19.0567 20.1648L12.2464 13.3532C9.21674 15.5071 5.04206 14.9803 2.64256 12.1412C0.243061 9.30216 0.41925 5.09805 3.04788 2.46972C5.67581 -0.159752 9.88033 -0.336703 12.7199 2.06267C15.5595 4.46204 16.0866 8.63713 13.9326 11.667L20.7429 18.4786L19.0579 20.1636L19.0567 20.1648ZM8.10293 2.75809C5.84317 2.75758 3.89359 4.34383 3.43454 6.55647C2.97549 8.76911 4.13314 11 6.2066 11.8985C8.28006 12.797 10.6994 12.1161 12 10.2681C13.3005 8.42004 13.1247 5.91283 11.579 4.26437L12.3 4.97937L11.4873 4.16904L11.473 4.15474C10.5813 3.25763 9.36776 2.75468 8.10293 2.75809Z'
const loaderSVGPath = 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
const hideSearchSVGPath = 'm11.16 9.81 7.81-7.8L17.56.58 9.74 8.4 1.93.6.5 2l7.82 7.81-7.74 7.75L2 18.97l7.74-7.74 7.75 7.74 1.4-1.41-7.73-7.75Z'

test.beforeEach(async ({ page }) => {
  await page.goto('https://www.gentwo.com/pulse/');
});

test('Pulse tab', async ({ page }) => {

  // Expect title to contain Pulse.
  await expect(page).toHaveTitle(/Pulse/);
});

test.describe('Search', () => {
  test('should allow me to show/hide the search input', async ({ page }) => {
    const searchInputLocator = await openSearchInputAndGetLocator(page);

    const placeholder = await searchInputLocator.getAttribute('placeholder');

    await expect(placeholder).toBe("Search in Pulse");

    const hideSearchButtonLocator = await getHideSearchButtonLocator(page);

    await hideSearchButtonLocator.click();

    const searchInputLocatorAfterHide = page.locator('input[id="subnav-search-input"]');

    await expect(searchInputLocatorAfterHide).toHaveCount(0);
  });

  test('loader should show/hide when I type/clear text', async ({ page }) => {
    const searchInputLocator = await openSearchInputAndGetLocator(page);

    await searchInputLocator.type('test');

    const loaderLocator = getLoaderButtonLocator(page);

    await expect(loaderLocator).toHaveCount(1);

    await searchInputLocator.fill('');

    const loaderLocatorAfterClearingText = getLoaderButtonLocator(page);

    // This test is failing because in case you clear the input while loader is sill displayed
    // the loader will be there until page refresh. This is a bug
    await expect(loaderLocatorAfterClearingText).toHaveCount(0);
  });

  test('should allow me to search', async ({ page }) => {
    const searchInputLocator = await openSearchInputAndGetLocator(page);

    const searchPhrase = 'test';

    await searchInputLocator.type(searchPhrase);

    // Given that we don't know the exact result for this search
    // We only make sure that the search is done by checking the result indicator
    const searchResultLocator = page.locator('text=results for "' + searchPhrase + '"');

    await expect(searchResultLocator).toHaveCount(1);
  });
});

function getSearchLocator(page: Page) {
  const searchSVGLocator = page.locator('path[d="' + searchSVGPath + '"]');

  const searchButtonLocator = page.locator('button', { has: searchSVGLocator })

  return searchButtonLocator;
}

function getLoaderButtonLocator(page: Page) {
  const loaderLocator = page.locator('path[d="' + loaderSVGPath + '"]');

  const loadderButtonLocator = page.locator('button', { has: loaderLocator })

  return loadderButtonLocator;
}

async function getHideSearchButtonLocator(page: Page) {
  const hideSearchLocator = page.locator('path[d="' + hideSearchSVGPath + '"]');

  const hideSearchButtonLocator = page.locator('button', { has: hideSearchLocator });

  const count = await hideSearchButtonLocator.count();

  for (let i = 0; i < count; i++) {
    const locator = hideSearchButtonLocator.nth(i);

    const locatorClass = await locator.getAttribute('class');

    // since there are two buttons, select the one that dosn't have this class
    if(!locatorClass.includes('button-close-mobile-nav')){
      return locator;
    }
  }

  return null;
}

async function openSearchInputAndGetLocator(page: Page) {
  const searchButtonLocator = getSearchLocator(page);

  await searchButtonLocator.click();

  const searchInputLocator = page.locator('input[id="subnav-search-input"]');

  return searchInputLocator;
}