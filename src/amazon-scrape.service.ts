import * as cheerio from 'cheerio';
import * as moment from 'moment';

const scrapeAmazon = (url?: string) => {
    if (!url) {
        return;
    }

    const headers = {
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:106.0) Gecko/20100101 Firefox/106.0',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        TE: 'Trailers',
    };

    const response = UrlFetchApp.fetch(url, { headers });
    const content = response.getContentText();
    const $ = cheerio.load(content);

    const productPrice =
        $('.a-price.priceToPay > span.a-offscreen').last().text().trim().substring(1) || 'N/A';

    const productCategory =
        $('span.a-list-item > a.a-link-normal.a-color-tertiary').last().text().trim() || 'N/A';

    const $productDetailsKeys = $('.prodDetSectionEntry');

    const findValue = (key: string) => {
        return $productDetailsKeys
            .filter((_, el) => $(el).text().trim() === key)
            .next()
            .text()
            .trim();
    };

    const asin = findValue('ASIN') || 'N/A';

    const bestSellerRank = findValue('Best Sellers Rank') || 'N/A';

    const dateFirstAvailable = (() => {
        const match = findValue('Date First Available');

        // @ts-expect-error: Moment
        const parseResult = moment.moment(match);

        return parseResult.isValid() ? parseResult.format('YYYY-MM-DD') : 'N/A';
    })();

    const values = [asin, productCategory, productPrice, bestSellerRank, dateFirstAvailable];

    console.log(values);

    return values;
};
