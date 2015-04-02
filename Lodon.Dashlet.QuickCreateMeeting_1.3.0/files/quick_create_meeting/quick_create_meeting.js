({
	plugins: ['Dashlet'],
	events: {
		'click #quick-create-meeting-save': 'onSaveClick'
	},
	setPlannedDate:function() {
		var d = new Date();
		var year = d.getFullYear();
		var month = d.getMonth()+1 < 10 ? "0"+(d.getMonth()+1) : (d.getMonth()+1);
		var day = d.getDate() < 10 ? "0"+d.getDate() : d.getDate();
		var hour = d.getHours() < 10 ? "0"+d.getHours() : d.getHours(); 
		var min = d.getMinutes() < 10 ? "0"+d.getMinutes() : d.getMinutes();
		$("#quick-create-meeting-dp").val(year+"-"+month+"-"+day);
		$("#quick-create-meeting-tp").val(hour+":"+min);
	},
	getCallObject:function(subject) {
		
		var date = $("#quick-create-meeting-dp").val().split("-");
		var time = $("#quick-create-meeting-tp").val().split(":");
		var date_start = new Date(date[0], date[1]-1, date[2], time[0], time[1]);
		var duration_hours = $("#quick-create-meeting-duration-h").val();
		var duration_minutes = $("#quick-create-meeting-duration-m").val();
		var status = "Planned";
	
		var description = $('#quick-create-meeting-description').val();
		$('#quick-create-meeting-description').val("");
		$("#quick-create-meeting-duration-h").val("0");
		$("#quick-create-meeting-duration-h").val("0");
		this.setPlannedDate();

		return {
			"name":subject,
			"date_start":date_start,
			"duration_hours":duration_hours,
			"duration_minutes":duration_minutes,
			"status":status,
			"direction":"Outbound",
			"assigned_user_id": app.user.id, 
			"description": description
		};
	},
	processAccount:function() {
		var account_id = this.model.get("id");
		var account_name = this.model.get("name");
		var subject;
		var contact = $('#quick-create-meeting-contacts').val();

		if(contact){		
			var contactObj = JSON.parse( contact );	
			subject = account_name + " - " + contactObj.full_name;
		} else {
			subject = account_name;
		}

		callObject = this.getCallObject(subject);
		var url = app.api.buildURL('Accounts', account_id);
		url = url + '/link/meetings';
		app.api.call("create", url, callObject,
		{
			success:function(new_call_data){
				//if we have a contact => link the meeting to the contact
				if (contact) {
					var url2 = app.api.buildURL('Meetings', new_call_data.related_record.id);
					url2 = url2 + '/link';
					app.api.call("create", url2,
						{
							link_name: "contacts",
							ids: [contactObj.id]
						}, {
						success:function(new_call_link_contact) {
							app.controller.context.trigger('subpanel:reload',{links:['meetings']});
						},
						complete:function() {
							$("#quick-create-meeting-save").removeAttr("disabled");
						}
					});
				}
				else {
					app.controller.context.trigger('subpanel:reload',{links:['meetings']});
				}
			},
			complete:function() {
				if (!contact) {
					$("#quick-create-meeting-save").removeAttr("disabled");
				}
			}
		});

	},
	processContact:function() {
		var contact = JSON.parse($('#quick-create-meeting-contacts').val());

		if (this.model.get("account_id")) {
			var module_create = "Accounts";	
			var id_create = this.model.get("account_id");
			var subject = this.model.get("account_name") + " - " + contact.full_name;
		} else {
			var module_create = "Contacts";
			var id_create = this.model.get("id");
			var subject = contact.full_name;
		}

		callObject = this.getCallObject(subject);
		var url = app.api.buildURL(module_create, id_create);
		url = url + '/link/meetings';
		app.api.call("create", url, callObject,
		{
			success:function(new_call_data){
				if (module_create == "Accounts") {
					var url2 = app.api.buildURL('Meetings', new_call_data.related_record.id);
					url2 = url2 + '/link';
					app.api.call("create", url2,
					{
						link_name: "contacts",
						ids: [
							contact.id
						]
					},{
						success:function(new_call_link_contact) {
							app.controller.context.trigger('subpanel:reload',{links:['meetings']});
						},
						complete:function() {
							$("#quick-create-meeting-save").removeAttr("disabled");
						}
					});
				}
				else {
					app.controller.context.trigger('subpanel:reload',{links:['meetings']});
				}
			},
			complete:function() {
				if (module_create == "Contacts") {
					$("#quick-create-meeting-save").removeAttr("disabled");
				}
			}
		});
	},
	processCommon:function() {
		var common = JSON.parse($('#quick-create-meeting-contacts').val());
		var module_create = this.model.get("_module");
		var id_create = this.model.get("id");
		var subject = common.full_name;
		
		callObject = this.getCallObject(subject);
		var url = app.api.buildURL(module_create, id_create);
		url = url + '/link/meetings';
		app.api.call("create", url ,callObject,
		{
			success:function(new_call_data){
				app.controller.context.trigger('subpanel:reload',{links:['meetings']});
			},
			complete:function() {
				$("#quick-create-meeting-save").removeAttr("disabled");
			}
		});
	},
	onSaveClick: function(event){
		
		event.preventDefault();
		$("#quick-create-meeting-save").attr("disabled","disabled");

		if ( this.model.get("_module") == "Accounts") {
			this.processAccount();
		} else if ( this.model.get("_module") == "Contacts" ) {
			this.processContact();
		} else if ( (this.model.get("_module") == "Leads") || (this.model.get("_module") == "Prospects") ) {
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
		$('#quick-create-meeting-dp').datepicker({format: 'yyyy-mm-dd'});
		$('#quick-create-meeting-tp').timepicker({timeFormat:'H:i'});
		this.setPlannedDate();
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
		var self = this;
		var account_id = this.model.get("id");
		var module_type = this.model.get("_module");

		if (this.disposed /*|| this.meta.config*/) {
			return;
		}

		// If the dashlet is called from an account, get all contacts.
		if(module_type == "Accounts"){
			var url = app.api.buildURL('Accounts', account_id);
			url = url + '/link/contacts';
			app.api.call('READ', url, {},
			{
				success:function(data_account){
					self.account_contacts = data_account.records;
					self.render();
				}
			});
		}
		// If the dashlet is called from a contact.
		else{
			var single_contact = new Array();
			single_contact[0] = this.model.attributes;
			self.only_contacts = single_contact;
			self.render();
		}
		
	}
})


