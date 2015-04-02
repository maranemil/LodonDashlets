({
    plugins: ['Dashlet'],
    _defaultOptions: {
        limit: 10,
    },
    bindDataChange: function () {
		if (this.model) {
            this.model.on("change", this.loadData, this);
            this.model.on("changenol", this.loadData, this);
            this.model.on("subpanel:reload", this.loadData, this);
        }
    },
    _render: function () {
		if (this.all_call_history || this.meta.config) {
            app.view.View.prototype._render.call(this);
        }
    },
    initDashlet: function (view) {
		if (this.meta.config) {
            this.dashletConfig = app.metadata.getView(app.controller.context.get('module'), this.name) || this.dashletConfig;
        }
        this.viewName = view;
        var settings = _.extend({}, this._defaultOptions, this.settings.attributes);
        this.settings.set(settings);
    },
	loadData: function (options)
	{
		if (this.disposed || this.meta.config) {
			$('#record-cell').find(':input').prop('disabled', true);
			$("#record-cell :input").prop("disabled", true);
            return;
        }
		var self = this;
		var url = app.api.buildURL('Accounts', this.model.get("id") );
		url = url + '/account_history';
	    app.api.call('READ',url,{}, {
	    	success:function(data) {
				self.all_call_history = data;
				self.number_of_calls = new Array();
				self.number_of_calls[0] = {'total_calls':self.all_call_history.length};

				self.all_call_history.sort(function(a, b) {
					var date_a=a.date_start;
					var date_b=b.date_start;
					if (date_a < date_b)
						return 1
					if (date_a > date_b)
						return -1
					return 0
				});
				self.render();
			}
		});
	}
})


