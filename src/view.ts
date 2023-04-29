const onOpen = () => {
    SpreadsheetApp.getUi()
        .createMenu('Rainforest API')
        .addItem('Get Sales Estimation', 'main')
        .addToUi();
};
