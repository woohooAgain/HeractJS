﻿define([
    'comindware/core',
    './ChartView',
    './template/Dashboard.html'
], function (core, ChartView) {
    'use strict';

    return Marionette.LayoutView.extend({
        initialize: function () {
        },

        template: Handlebars.compile("<div class='chart-test-region'></div>"),

        regions: {
            chartRegion: ".chart-test-region",
        },
        className: "dashboard-test",
        onShow: function () {
            this.chartRegion.show(new ChartView({}));
        }
    })
});