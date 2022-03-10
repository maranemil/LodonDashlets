({
    plugins: ['Dashlet'],
    events: {
        'click #quick-create-call-save': 'onSaveClick',
        'click #quick-create-call-status-radio2': 'onRadioBtn',
        'click #quick-create-call-status-radio1': 'onRadioBtn'
    },
    setPlannedDate: function () {
        const d = new Date();
        const year = d.getFullYear();
        const month = d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1);
        const day = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
        const hour = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
        const min = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
        $("#quick-create-call-dp").val(year + "-" + month + "-" + day);
        $("#quick-create-call-tp").val(hour + ":" + min);
    },
    onRadioBtn: function () {
        if ($("#quick-create-call-status-radio2").is(':checked')) {
            $("#quick-create-call-datetime").show();
            $('#quick-create-call-dp').datepicker({format: 'yyyy-mm-dd'});
            $('#quick-create-call-tp').timepicker({timeFormat: 'H:i'});
            this.setPlannedDate();
        } else {
            $("#quick-create-call-datetime").hide();
        }
    },
    getCallObject: function (subject) {
        let status;
        let duration_minutes;
        let duration_hours;
        let date_start;
        if ($("#quick-create-call-status-radio2").is(':checked')) {
            let date = $("#quick-create-call-dp").val().split("-");
            const time = $("#quick-create-call-tp").val().split(":");
            date_start = new Date(date[0], date[1] - 1, date[2], time[0], time[1]);
            duration_hours = $("#quick-create-call-duration-h").val();
            duration_minutes = $("#quick-create-call-duration-m").val();
            status = "Planned";
        } else {
            date_start = new Date();
            duration_hours = 0;
            duration_minutes = 15;
            status = "Held";
        }
        const description = $('#quick-create-call-description').val();
        $('#quick-create-call-description').val("");
        $("#quick-create-call-duration-h").val("0");
        $("#quick-create-call-duration-h").val("0");
        this.setPlannedDate();

        return {
            "name": subject,
            "date_start": date_start,
            "duration_hours": duration_hours,
            "duration_minutes": duration_minutes,
            "status": status,
            "direction": "Outbound",
            "assigned_user_id": app.user.id,
            "description": description
        };
    },
    processAccount: function () {
        const contactObj = JSON.parse(contact);
        let account_id = this.model.get("id");
        const account_name = this.model.get("name");
        let subject;
        const contact = $('#quick-create-call-contacts').val();

        if (contact) {
            subject = account_name + " - " + contactObj.full_name;
        } else {
            subject = account_name;
        }

        callObject = this.getCallObject(subject);
        let url = app.api.buildURL('Accounts', account_id);
        url = url + '/link/calls';
        app.api.call("create", url, callObject,
            {
                success: function (new_call_data) {
                    //if we have a contact => link the call to the contact
                    if (contact) {
                        let url2 = app.api.buildURL('Calls', new_call_data.related_record.id);
                        url2 = url2 + '/link';
                        app.api.call("create", url2,
                            {
                                link_name: "contacts",
                                ids: [contactObj.id]
                            }, {
                                success: function (new_call_link_contact) {
                                    app.controller.context.trigger('subpanel:reload', {links: ['calls']});
                                },
                                complete: function () {
                                    $("#quick-create-call-save").removeAttr("disabled");
                                }
                            });
                    } else {
                        app.controller.context.trigger('subpanel:reload', {links: ['calls']});
                    }
                },
                complete: function () {
                    if (!contact) {
                        $("#quick-create-call-save").removeAttr("disabled");
                    }
                }
            });

    },
    processContact: function () {
        let subject;
        let id_create;
        let module_create;
        let contact = JSON.parse($('#quick-create-call-contacts').val());

        if (this.model.get("account_id")) {
            module_create = "Accounts";
            id_create = this.model.get("account_id");
            subject = this.model.get("account_name") + " - " + contact.full_name;
        } else {
            module_create = "Contacts";
            id_create = this.model.get("id");
            subject = contact.full_name;
        }

        callObject = this.getCallObject(subject);

        let url = app.api.buildURL(module_create, id_create);
        url = url + '/link/calls';
        app.api.call("create", url, callObject,
            {
                success: function (new_call_data) {
                    if (module_create === "Accounts") {

                        let url2 = app.api.buildURL('Calls', new_call_data.related_record.id);
                        url2 = url2 + '/link';
                        app.api.call("create", url2,
                            {
                                link_name: "contacts",
                                ids: [
                                    contact.id
                                ]
                            }, {
                                success: function (new_call_link_contact) {
                                    app.controller.context.trigger('subpanel:reload', {links: ['calls']});
                                },
                                complete: function () {
                                    $("#quick-create-call-save").removeAttr("disabled");
                                }
                            });
                    } else {
                        app.controller.context.trigger('subpanel:reload', {links: ['calls']});
                    }
                },
                complete: function () {
                    if (module_create === "Contacts") {
                        $("#quick-create-call-save").removeAttr("disabled");
                    }
                }
            });
    },
    processCommon: function () {
        let common = JSON.parse($('#quick-create-call-contacts').val());
        const module_create = this.model.get("_module");
        const id_create = this.model.get("id");
        const subject = common.full_name;

        callObject = this.getCallObject(subject);

        let url = app.api.buildURL(module_create, id_create);
        url = url + '/link/calls';
        app.api.call("create", url, callObject,
            {
                success: function (new_call_data) {
                    app.controller.context.trigger('subpanel:reload', {links: ['calls']});
                },
                complete: function () {
                    $("#quick-create-call-save").removeAttr("disabled");
                }
            });
    },
    onSaveClick: function (event) {

        event.preventDefault();
        $("#quick-create-call-save").attr("disabled", "disabled");

        if (this.model.get("_module") === "Accounts") {
            this.processAccount();
        } else if (this.model.get("_module") === "Contacts") {
            this.processContact();
        } else if ((this.model.get("_module") === "Leads") || (this.model.get("_module") === "Prospects")) {
            this.processCommon();
        }

    },
    bindDataChange: function () {
        if (this.model) {
            this.model.on("change", this.loadData, this);
        }
    },
    _render: function () {
        if (this.account_contacts || this.meta.config || this.only_contacts) {
            app.view.View.prototype._render.call(this);
        }
    },
    initDashlet: function (view) {
        if (this.meta.config) {
            this.dashletConfig = app.metadata.getView(app.controller.context.get('module'), this.name) || this.dashletConfig;
        }
        this.viewName = view;
        let settings = _.extend({}, this._defaultOptions, this.settings.attributes);
        this.settings.set(settings);
    },
    loadData: function (options) {
        const self = this;
        const account_id = this.model.get("id");
        const module_type = this.model.get("_module");

        if (this.disposed /*|| this.meta.config*/) {
            return;
        }

        // If the dashlet is called from an account, get all contacts.
        if (module_type === "Accounts") {

            let url = app.api.buildURL('Accounts', account_id);
            url = url + '/link/contacts';
            app.api.call('READ', url, {},
                {
                    success: function (data_account) {
                        self.account_contacts = data_account.records;
                        self.render();
                    }
                });
        }
        // If the dashlet is called from a contact.
        else {
            const single_contact = new Array();
            single_contact[0] = this.model.attributes;
            self.only_contacts = single_contact;
            self.render();
        }

    }
})


