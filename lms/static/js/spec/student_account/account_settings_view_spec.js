define(['backbone', 'jquery', 'underscore', 'js/common_helpers/ajax_helpers', 'js/common_helpers/template_helpers',
        'js/student_account/models/account_settings_models', 'js/student_account/views/account_settings_view',
        'js/student_account/views/account_settings_fields'],
    function (Backbone, $, _, AjaxHelpers, TemplateHelpers, AccountSettingsModel, AccountSettingsView,
              AccountSettingsFieldViews) {
        'use strict';

        describe("Account Settings View", function () {

            var createAccountSettingsView = function (model, data) {

                var accountSettingsView = new AccountSettingsView({
                    el: $('.account-settings-container'),
                    model: model,
                    sections : data.sections || createMockAccountSettingsSections()
                });
                return accountSettingsView.render().renderFields();
            };

            beforeEach(function () {
                setFixtures('<div class="account-settings-container"> </div>');
                TemplateHelpers.installTemplate('templates/student_account/account_settings');
                TemplateHelpers.installTemplate('templates/student_account/field_readonly');
                TemplateHelpers.installTemplate('templates/student_account/field_dropdown');
                TemplateHelpers.installTemplate('templates/student_account/field_link');
                TemplateHelpers.installTemplate('templates/student_account/field_text');
            });

            it("can render all sections as expected", function() {

                var model = new AccountSettingsModel();

                var sectionsData = [
                    {
                        title: "Basic Account Information",
                        fields: [
                            {
                                title: "Username"
                            },
                            {
                                title: "Full Name"
                            }
                        ]
                    },
                    {
                        title: "Demographics and Additional Details",
                        fields: [
                            {
                                title: "Educational Background"
                            }
                        ]
                    }
                ]

                var sections = [
                    {
                        title: sectionsData[0].title,
                        fields: [
                            {
                                view: new AccountSettingsFieldViews.ReadonlyFieldView({
                                    model: model,
                                    title: sectionsData[0].fields[0].title,
                                    valueAttribute: "username",
                                })
                            },
                            {
                                view: new AccountSettingsFieldViews.TextFieldView({
                                    model: model,
                                    title: sectionsData[0].fields[1].title,
                                    valueAttribute: "name",
                                })
                            },
                        ]
                    },
                    {
                        title: sectionsData[1].title,
                        fields: [
                            {
                                view: new AccountSettingsFieldViews.DropdownFieldView({
                                    model: model,
                                    title: sectionsData[1].fields[0].title,
                                    valueAttribute: "level_of_education",
                                    options: [['s', 'School'], ['u', 'University']],
                                })
                            },
                        ]
                    },
                ]

                var accountSettingsView = createAccountSettingsView(model, {sections: sections, renderFields: true});

                var sectionViews = accountSettingsView.$('.account-settings-section');
                expect(sectionViews.length).toBe(2);
                _.each(sectionViews, function(sectionView, sectionIndex) {

                    expect($(sectionView).find('.account-settings-section-header').text().trim()).toBe(sectionsData[sectionIndex].title);

                    var sectionFieldViews = $(sectionView).find('.account-settings-field');
                    expect(sectionFieldViews.length).toBe(sectionsData[sectionIndex].fields.length);

                    _.each(sectionFieldViews, function(sectionFieldView, fieldIndex) {
                        var fieldTitle = $(sectionFieldView).find('.account-settings-field-title').text().trim();
                        expect(fieldTitle).toBe(sectionsData[sectionIndex].fields[fieldIndex].title);
                    });
                });
            });
        });
    });
