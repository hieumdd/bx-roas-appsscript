type GetSalesEstimationOptions = {
    bestSellerRank: string;
    salesEstimationCategory: string;
};

type GetSalesEstimationResponse = {
    request_info: {
        success: boolean;
        message: string;
        credits_used: number;
        credits_remaining: number;
        credits_used_this_request: number;
    };
    sales_estimation: {
        has_sales_estimation: boolean;
        message?: string;
        monthly_sales_estimate?: number;
    };
};

const getSalesEstimation = (options: GetSalesEstimationOptions) => {
    const apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');

    const queryString = [
        `api_key=${apiKey}`,
        `type=sales_estimation`,
        `amazon_domain=amazon.com`,
        `bestseller_rank=${options.bestSellerRank}`,
        `sales_estimation_category=${encodeURIComponent(options.salesEstimationCategory)}`,
    ].join('&');

    console.log({ queryString });

    const url = `https://api.rainforestapi.com/request?${queryString}`;

    try {
        const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });

        const data: GetSalesEstimationResponse = JSON.parse(response.getContentText());

        if (response.getResponseCode() > 200) {
            SpreadsheetApp.getUi().alert(data.request_info.message);
            return;
        }

        if (!data.sales_estimation.has_sales_estimation) {
            const message = [
                `Best Seller Rank: ${options.bestSellerRank}`,
                `Sales Estimation Category: ${options.salesEstimationCategory}`,
                `Message: ${data.sales_estimation.message}`,
            ].join('\n');
            SpreadsheetApp.getUi().alert(message);
            return;
        }

        return data.sales_estimation.monthly_sales_estimate;
    } catch (error) {
        console.log({ error });
        return;
    }
};

const main = () => {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ROAS Calculator');

    const [salesEstimationCategory, startingBestSellerRank, endingBestSellerRank] = [
        'C9:C9',
        'C11:C11',
        'C20:C20',
    ].map((range) => sheet.getRange(range).getCell(1, 1).getValue() as string | undefined);

    if (!salesEstimationCategory || !startingBestSellerRank || !endingBestSellerRank) {
        const message = [
            !salesEstimationCategory ? 'Product Category' : undefined,
            !startingBestSellerRank ? 'Starting BSR' : undefined,
            !endingBestSellerRank ? 'Ending BSR' : undefined,
        ]
            .filter((text) => !!text)
            .map((text) => `Invalid ${text}`)
            .join('\n');

        SpreadsheetApp.getUi().alert(message);
        return;
    }

    [
        [startingBestSellerRank, 'C14:C14'],
        [endingBestSellerRank, 'C21:C21'],
    ].forEach(([bestSellerRank, range]) => {
        const estimation = getSalesEstimation({ salesEstimationCategory, bestSellerRank });
        estimation && sheet.getRange(range).getCell(1, 1).setValue(estimation);
    });
};
