define(['backbone', 'jquery', 'underscore', 'js/common_helpers/ajax_helpers', 'js/common_helpers/template_helpers',
        'js/student_account/models/account_settings_models', 'js/student_account/views/account_settings_fields',
        'string_utils'],
    function (Backbone, $, _, AjaxHelpers, TemplateHelpers, AccountSettingsModel, AccountSettingsFieldViews) {
        'use strict';

        describe("AccountSettingsFieldViews", function () {

            var requests,
                timerCallback;

            var fieldsViews = [
                AccountSettingsFieldViews.ReadonlyFieldView,
                AccountSettingsFieldViews.TextFieldView,
                AccountSettingsFieldViews.EmailFieldView,
                AccountSettingsFieldViews.DropdownFieldView,
                AccountSettingsFieldViews.LinkFieldView,
                AccountSettingsFieldViews.PasswordFieldView,
            ];

            var MOCK_USERNAME = 'Legolas',
                MOCK_FULLNAME = 'Legolas Thranduil',
                MOCK_EMAIL = 'legolas@woodland.middlearth',
                MOCK_LANGUAGE = [['si', 'sindarin'], ['el', 'elvish']],
                MOCK_COUNTRY = 'woodland',
                MOCK_DATE_JOINED = '',
                MOCK_GENDER = 'male',
                MOCK_GOALS = '',
                MOCK_LEVEL_OF_EDUCATION = null,
                MOCK_MAILING_ADDRESS = '',
                MOCK_YEAR_OF_BIRTH = null;

            var MOCK_API_URL = '/mock_service/api/user/v0/accounts/user';

            var createMockAccountSettingsModel = function (data) {
                data = {
                    username: data.username || MOCK_USERNAME,
                    name: data.name || MOCK_FULLNAME,
                    email: data.email || MOCK_EMAIL,
                    password: data.password || '',
                    language: _.isUndefined(data.language) ? MOCK_LANGUAGE[0][0] : data.language,
                    country: data.country || MOCK_COUNTRY,
                    date_joined: data.date_joined || MOCK_DATE_JOINED,
                    gender: data.gender || MOCK_GENDER,
                    goals: data.goals || MOCK_GOALS,
                    level_of_education: data.level_of_education || MOCK_LEVEL_OF_EDUCATION,
                    mailing_address: data.mailing_address || MOCK_MAILING_ADDRESS,
                    year_of_birth: data.year_of_birth || MOCK_YEAR_OF_BIRTH
                };
                var model = new AccountSettingsModel(data);
                model.url = '/mock_service/api/user/v0/accounts/user';
                return model;
            };

            var createFieldData = function (fieldType, fieldData) {
                var data = {
                    model: fieldData.model || createMockAccountSettingsModel({}),
                    title: fieldData.title || 'Field Title',
                    valueAttribute: fieldData.valueAttribute,
                    helpMessage: fieldData.helpMessage || 'I am a field message'
                };

                switch (fieldType) {
                    case AccountSettingsFieldViews.DropdownFieldView:
                        data['required'] = fieldData.required || false;
                        data['options'] = fieldData.options || [['1', 'Option1'], ['2', 'Option2'], ['3', 'Option3']];
                        break;
                    case AccountSettingsFieldViews.LinkFieldView:
                    case AccountSettingsFieldViews.PasswordFieldView:
                        data['linkTitle'] = fieldData.linkTitle || "Link Title";
                        data['linkHref'] = fieldData.linkHref || "/path/to/resource";
                        data['emailAttribute'] = 'email';
                        break;
                }

                return data;
            };

            var createErrorMessage = function(attribute, user_message) {
                var field_errors = {}
                field_errors[attribute] = {
                    "user_message": user_message,
                }
                return {
                    "field_errors": field_errors
                }
            };

            var expectTitleAndMessageToBe = function(view, expectedTitle, expectedMessage) {
                expect(view.$('.account-settings-field-title').text().trim()).toBe(expectedTitle);
                expect(view.$('.account-settings-field-message').text().trim()).toBe(expectedMessage);
            };

            var expectMessageContains = function(view, expectedText) {
                expect(view.$('.account-settings-field-message').html()).toContain(expectedText);
            };

            var expectAjaxRequestWithData = function(data) {
                AjaxHelpers.expectJsonRequest(
                    requests, 'PATCH', MOCK_API_URL, data
                );
            };

            beforeEach(function () {
                TemplateHelpers.installTemplate('templates/student_account/account_settings');
                TemplateHelpers.installTemplate('templates/student_account/field_readonly');
                TemplateHelpers.installTemplate('templates/student_account/field_dropdown');
                TemplateHelpers.installTemplate('templates/student_account/field_link');
                TemplateHelpers.installTemplate('templates/student_account/field_text');

                timerCallback = jasmine.createSpy('timerCallback');
                jasmine.Clock.useMock();

            });

            it("updates messages correctly for all fields", function() {
                for (var i=0; i<fieldsViews.length; i++) {
                    var fieldView = fieldsViews[i];
                    var fieldData = createFieldData(fieldView, {
                        title: 'Username',
                        valueAttribute: 'username',
                        helpMessage: 'This is your login username.'
                    })

                    var view = new fieldView(fieldData).render();

                    var message = "This is field no." + i + "." ;
                    view.message(message);
                    expectMessageContains(view, message);

                    view.showHelpMessage();
                    expectMessageContains(view, view.helpMessage);

                    view.showInProgressMessage();
                    expectMessageContains(view, view.inProgressMessage);

                    view.showSuccessMessage();
                    expectMessageContains(view, view.successMessagePrefix);

                    expect(timerCallback).not.toHaveBeenCalled();

                    view.showErrorMessage({
                        responseText: JSON.stringify(createErrorMessage(fieldData.valueAttribute, 'Please fix this.')),
                        status: 400
                    });
                    expectMessageContains(view, view.invalidInputMessagePrefix);

                    view.showErrorMessage({status: 500});
                    expectMessageContains(view, view.errorMessage);
                }
            });

            it("resets to help message some time after success message is set", function() {
                for (var i=0; i<fieldsViews.length; i++) {
                    var fieldView = fieldsViews[i];
                    var fieldData = createFieldData(fieldView, {
                        title: 'Username',
                        valueAttribute: 'username',
                        helpMessage: 'This is your login username.'
                    })

                    var view = new fieldView(fieldData).render();

                    view.showHelpMessage();
                    expectMessageContains(view, view.helpMessage);
                    view.showSuccessMessage();
                    expectMessageContains(view, view.successMessagePrefix);
                    jasmine.Clock.tick(5000);
                    // Message gets reset
                    expectMessageContains(view, view.helpMessage);

                    view.showSuccessMessage();
                    expectMessageContains(view, view.successMessagePrefix);
                    // But if we change the message, it should not get reset.
                    view.message("Do not reset this!");
                    jasmine.Clock.tick(5000);
                    expectMessageContains(view, "Do not reset this!");
                }
            });

            it("sends a PATCH request when saveAttributes is called", function() {

                requests = AjaxHelpers.requests(this);

                var fieldView = AccountSettingsFieldViews.FieldView;
                var fieldData = createFieldData(fieldView, {
                    title: 'Preferred Language',
                    valueAttribute: 'language',
                    helpMessage: 'Your preferred language.'
                })

                var view = new fieldView(fieldData);
                view.saveAttributes({'language': 'ur'}, {
                    'headers': {'Priority': 'Urgent'}
                });

                var request = requests[0];
                expect(request.method).toBe('PATCH');
                expect(request.requestHeaders['Content-Type']).toBe('application/merge-patch+json;charset=utf-8');
                expect(request.requestHeaders['Priority']).toBe('Urgent');
                expect(request.requestBody).toBe('{"language":"ur"}');
            });

            it("correctly renders ReadonlyFieldView", function() {
                var fieldData = createFieldData(AccountSettingsFieldViews.ReadonlyFieldView, {
                    title: 'Username',
                    valueAttribute: 'username',
                    helpMessage: 'This is your login username'
                });
                var view = new AccountSettingsFieldViews.ReadonlyFieldView(fieldData).render();

                expectTitleAndMessageToBe(view, fieldData.title, fieldData.helpMessage);
                expect(view.$('.account-settings-field-value').text().trim()).toBe(MOCK_USERNAME);
            });

            it("correctly updates ReadonlyFieldView on model update", function() {
                var fieldData = createFieldData(AccountSettingsFieldViews.ReadonlyFieldView, {
                    title: 'Username',
                    valueAttribute: 'username',
                    helpMessage: 'This is your login username'
                });
                var view = new AccountSettingsFieldViews.ReadonlyFieldView(fieldData).render();

                expect(view.$('.account-settings-field-value').text().trim()).toBe(MOCK_USERNAME);
                view.model.set({'username': 'bookworm'});
                expect(view.$('.account-settings-field-value').text().trim()).toBe('bookworm');
            });

            it("correctly renders TextFieldView", function() {
                var fieldData = createFieldData(AccountSettingsFieldViews.TextFieldView, {
                    title: 'Full Name',
                    valueAttribute: 'name',
                    helpMessage: 'This is used on your edX certificates, and all changes are reviewed.'
                });
                var view = new AccountSettingsFieldViews.TextFieldView(fieldData).render();

                expectTitleAndMessageToBe(view, fieldData.title, fieldData.helpMessage);
                expect(view.$('.account-settings-field-value > input').val()).toBe(MOCK_FULLNAME);
            });

            it("correctly persists changes to TextFieldView, EmailFieldView & DropdownFieldView", function() {

                requests = AjaxHelpers.requests(this);

                var validationError = "Name must be longer than 3 characters.";

                var fields = [
                    [AccountSettingsFieldViews.TextFieldView, '.account-settings-field-value > input', 'Next'],
                    [AccountSettingsFieldViews.EmailFieldView, '.account-settings-field-value > input', 'Next'],
                    [AccountSettingsFieldViews.DropdownFieldView, '.account-settings-field-value > select', '1'],
                ];

                for (var i=0; i<fields.length; i++) {

                    var fieldView = fields[i][0];
                    var fieldData = createFieldData(fieldView, {
                        title: 'Full Name',
                        valueAttribute: 'name',
                        helpMessage: 'edX full name'
                    });

                    var selector = fields[i][1];
                    var data = {'name': fields[i][2]};

                    var view = new fields[i][0](fieldData).render();

                    // Initially the help message is shown
                    expectMessageContains(view, fieldData.helpMessage);

                    view.$(selector).val(data.name).change();
                    // When the value in the field is changed
                    expect(view.fieldValue()).toBe(fields[i][2]);
                    expectMessageContains(view, view.inProgressMessage);
                    expectAjaxRequestWithData(data);

                    AjaxHelpers.respondWithNoContent(requests);
                    // When server returns success.
                    expectMessageContains(view, view.successMessagePrefix);

                    view.$(selector).val(data.name).change();
                    AjaxHelpers.respondWithError(requests, 500);
                    // When server returns a 500 error
                    expectMessageContains(view, view.errorMessage);

                    view.$(selector).val('').change();
                    AjaxHelpers.respondWithError(requests, 400, createErrorMessage(fieldData.valueAttribute, validationError));
                    // When server returns a validation error
                    expectMessageContains(view, view.invalidInputMessagePrefix);
                    expectMessageContains(view, validationError);
                }
            });

            it("correctly renders LinkFieldView", function() {
                var fieldData = createFieldData(AccountSettingsFieldViews.LinkFieldView, {
                    title: 'Title',
                    linkTitle: 'Link title',
                    helpMessage: 'Click the link.'
                });
                var view = new AccountSettingsFieldViews.LinkFieldView(fieldData).render();
                expectTitleAndMessageToBe(view, fieldData.title, fieldData.helpMessage);
                expect(view.$('.account-settings-field-value > a').text().trim()).toBe(fieldData.linkTitle);
            });

            it("sends request to reset password on clicking link in PasswordFieldView", function() {
                requests = AjaxHelpers.requests(this);

                var fieldData = createFieldData(AccountSettingsFieldViews.PasswordFieldView, {
                    linkHref: '/password_reset'
                });

                var view = new AccountSettingsFieldViews.PasswordFieldView(fieldData).render();
                view.$('.account-settings-field-value > a').click();
                AjaxHelpers.expectRequest(requests, 'POST', '/password_reset', "email=legolas%40woodland.middlearth");
                AjaxHelpers.respondWithJson(requests, {"success": "true"})
                expectMessageContains(view,
                    "Complete you password reset using the confirmation link emailed to legolas@woodland.middlearth."
                );
            });
        });
    });
