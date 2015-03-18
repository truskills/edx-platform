;(function (define) {

define([
    'jquery',
    'underscore',
    'backbone',
    'gettext'
], function ($, _, Backbone, gettext) {
   'use strict';

    return Backbone.View.extend({

        tagName: 'li',
        className: 'search-results-item',
        attributes: {
            'role': 'region',
            'aria-label': 'search result'
        },

        initialize: function () {
            var template_name = (this.model.attributes.content_type === "Sequence") ? '#search_item_seq-tpl' : '#search_item-tpl';
            this.tpl = _.template($(template_name).html());
        },

        render: function () {
            this.$el.html(this.tpl(this.model.attributes));
            return this;
        }
    });

});

})(define || RequireJS.define);
