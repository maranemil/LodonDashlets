({
    plugins: ['Dashlet'],
    events: {
        'click a[name=my-planned-calls-call]': 'onCallLink',
        'click #my-planned-calls-save': 'onSaveButton',
        'click #my-planned-calls-cancel': 'onCancelButton'
    },
    setActiveWhenContent: function (event) {
        event.preventDefault();
        $.each(['today', 'due', 'future'], function (index, value) {
            $('#my-planned-calls-' + value).hide();
            $('#my-planned-calls-' + value + '-label').removeClass("label-info");
        });
        $('#my-planned-calls-' + event.data.when).show();
        $('#my-planned-calls-' + event.data.when + '-label').addClass("label-info");
    },
    resetFormValues: function () {
        $("#my-planned-calls-description").val("");
        $("#my-planned-calls-status-radio1").attr("checked", false);
        $("#my-planned-calls-status-radio2").attr("checked", false);
        $("#my-planned-calls-dp").val("");
        $("#my-planned-calls-tp").val("");
        $("#my-planned-calls-duration-h").val("0");
        $("#my-planned-calls-duration-m").val("");
        $("#my-planned-calls-save").attr("disabled", "disabled");
        $("#my-planned-calls-cancel").attr("disabled", "disabled");
    },
    resetRowBackground: function () {
        $(".my-planned-calls-row").each(function (index, element) {
            $(element).css('background-color', '');
        });
    },
    onCancelButton: function (event) {
        event.preventDefault();
        this.resetRowBackground();
        this.resetFormValues();
    },
    onCallLink: function (event) {
        event.preventDefault();

        const id = $(event.target).data("obj-id");
        this.resetRowBackground();
        $(event.target).parent().parent().parent().css('background-color', '#f5f5f5');

        const url = app.api.buildURL('Calls', id);
        app.api.call('READ', url, {},
            {
                success: function (data) {
                    $("#my-planned-calls-description").data("id", data.id);
                    $("#my-planned-calls-description").val(data.description);
                    $("#my-planned-calls-status-radio1").attr("checked", data.status === "Held");
                    $("#my-planned-calls-status-radio2").attr("checked", data.status === "Planned");
                    $("#my-planned-calls-duration-h").val(data.duration_hours);
                    $("#my-planned-calls-duration-m").val(data.duration_minutes);

                    let d = new Date(data.date_start);
                    const year = d.getFullYear();
                    const month = d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1);
                    const day = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
                    const hour = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
                    const min = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
                    $("#my-planned-calls-dp").val(year + "-" + month + "-" + day);
                    $("#my-planned-calls-tp").val(hour + ":" + min);

                    $('#my-planned-calls-dp').datepicker({format: 'yyyy-mm-dd'});
                    $('#my-planned-calls-tp').timepicker({timeFormat: 'H:i'});

                    $("#my-planned-calls-save").removeAttr("disabled");
                    $("#my-planned-calls-cancel").removeAttr("disabled");
                }
            });
    },
    onSaveButton: function (event) {
        event.preventDefault();
        $("#my-planned-calls-save").attr("disabled", "disabled");
        $("#my-planned-calls-cancel").attr("disabled", "disabled");

        let saveObject = this.getCallObject();
        self = this;
        this.resetFormValues();

        const url = app.api.buildURL('Calls', saveObject.id);
        app.api.call('update', url, saveObject,
            {
                success: function (data) {
                    app.alert.show(data.id, {
                        level: 'success',
                        messages: 'Call updated.',
                        autoClose: true
                    });
                    self.loadData({smart: true});
                }
            });

    },
    getCallObject: function () {
        let id = $('#my-planned-calls-description').data("id");
        const description = $('#my-planned-calls-description').val();
        let status = '';
        if ($("#my-planned-calls-status-radio1").is(':checked')) {
            status = 'Held';
        }
        if ($("#my-planned-calls-status-radio2").is(':checked')) {
            status = 'Planned';
        }
        if ($("#my-planned-calls-status-radio3").is(':checked')) {
            status = 'Not Held';
        }
        const date = $("#my-planned-calls-dp").val().split("-");
        const time = $("#my-planned-calls-tp").val().split(":");
        const date_start = new Date(date[0], date[1] - 1, date[2], time[0], time[1]);
        const duration_hours = $("#my-planned-calls-duration-h").val();
        const duration_minutes = $("#my-planned-calls-duration-m").val();

        return {
            "id": id,
            "date_start": date_start,
            "duration_hours": duration_hours,
            "duration_minutes": duration_minutes,
            "status": status,
            "description": description
        };
    },
    fillTbodyContent: function (table, values) {
        table.empty();
        let rowsTemplate = Handlebars.templates["my_planned_calls.rows"];
        table.append(rowsTemplate({rows: values}));
    },
    renderContent: function () {
        this.fillTbodyContent($("#my-planned-calls-today > table"), this.today);
        this.fillTbodyContent($("#my-planned-calls-due > table"), this.due);
        this.fillTbodyContent($("#my-planned-calls-future > table"), this.future);

        $("a[rel=mpc-tooltip]").tooltip({container: 'body'});
        $("#my-planned-calls-save").attr("disabled", "disabled");
        $("#my-planned-calls-cancel").attr("disabled", "disabled");

        if ($("#my-planned-calls-today-label").length === 1) {
            $("#my-planned-calls-today-label").html("Today&nbsp;&nbsp;" + this.today.length);
            $("#my-planned-calls-due-label").html("Due&nbsp;&nbsp;" + this.due.length);
            $("#my-planned-calls-future-label").html("Future&nbsp;&nbsp;" + this.future.length);
        } else {
            let content = this.settings.attributes.label;
            const search = ".dashlet-title:contains('" + content + "')";
            $(search).append("<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>");
            $(search).append("<span id='my-planned-calls-today-label' class='label label-info'>Today&nbsp;&nbsp;" + this.today.length + "</span>");
            $(search).append("<span>&nbsp;&nbsp;</span>");
            $(search).append("<span id='my-planned-calls-due-label' class='label'>Due&nbsp;&nbsp;" + this.due.length + "</span>");
            $(search).append("<span>&nbsp;&nbsp;</span>");
            $(search).append("<span id='my-planned-calls-future-label' class='label'>Future&nbsp;&nbsp;" + this.future.length + "</span>");
            $('#my-planned-calls-today-label').click({when: 'today'}, this.setActiveWhenContent);
            $('#my-planned-calls-due-label').click({when: 'due'}, this.setActiveWhenContent);
            $('#my-planned-calls-future-label').click({when: 'future'}, this.setActiveWhenContent);
        }
    },
    _render: function () {
        if (this.today) { //|| this.meta.config
            app.view.View.prototype._render.call(this);
            this.renderContent();
        }
    },
    initDashlet: function (view) {
        if (this.meta.config) {
            this.dashletConfig = app.metadata.getView(app.controller.context.get('module'), this.name) || this.dashletConfig;
        }
        this.viewName = view;
        let settings = _.extend({}, this._defaultOptions, this.settings.attributes);
        this.settings.set(settings);
        templateName = this.name + '.rows';
        app.template.getView(templateName, this.module) || app.template.getView(templateName);
    },
    bindDataChange: function () {
        if (this.model) {
            this.model.on("change", this.loadData, this);
            this.model.on("reload-my-planned-calls", this.loadData, this);
        }
    },
    loadData: function (options) {
        let self = this;
        if (this.disposed /*|| this.meta.config*/) {
            return;
        }
        let url = app.api.buildURL('Calls/my_planned_calls');
        app.api.call('READ', url, {},
            {
                success: function (data) {
                    self.today = [];
                    self.due = [];
                    self.future = [];

                    let now = new Date();
                    const tomorrow = new Date(now);
                    tomorrow.setDate(now.getDate() + 1);
                    now.setHours(0, 0, 0, 0);
                    tomorrow.setHours(0, 0, 0, 0);

                    $.each(data, function (index, currentCall) {
                        current_date = app.date.parse(currentCall.date_start);
                        if (current_date < now) {
                            self.due.unshift(currentCall);
                        } else if (current_date > tomorrow) {
                            self.future.push(currentCall);
                        } else {
                            self.today.push(currentCall);
                        }
                    });

                    if (typeof options !== 'undefined' && options.smart) {
                        self.renderContent();
                    } else {
                        self.render();
                    }

                }
            });
    }
})
