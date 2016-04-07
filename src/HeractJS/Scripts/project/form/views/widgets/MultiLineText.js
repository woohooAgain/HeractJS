/**
 * Developer: Roman Shumskiy
 * Date: 01/10/2014
 * Copyright: 2010-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, _ */

define(['../../templates/widgets/multiLineText.html'],
    function (itemTmpl) {
        'use strict';
        return Marionette.ItemView.extend({
            initialize: function () {
                _.bindAll(this, "template");
                this.render();
            },
            className: 'card__i',
            template: Handlebars.compile(itemTmpl),
            onRender: function(){
                this.$el.addClass(this.className);
            }
        });
    });
