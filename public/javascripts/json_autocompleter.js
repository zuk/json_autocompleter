JSON.Autocompleter = Class.create(Autocompleter.Base, {
  initialize: function(container, update, url, options) {
    this.container = $(container);
    
    options = options || { }
    
    this.baseInitialize(this.container.down('input[type=text]'), update, options);
    this.id_field              = this.container.down('input[type=hidden]')
    this.options.asynchronous  = true;
    this.options.onComplete    = this.onComplete.bind(this);
    this.options.defaultParams = this.options.parameters || null;
    this.url                   = url;
    this.options.method        = this.options.method || 'get';
    this.options.paramName     = 'autocomplete';
    
    
    pulldown = document.createElement('img');
    pulldown.setAttribute('src', 'http://apps.urbacon.net/assets/images/pulldown.png');
    pulldown.setAttribute('alt', 'Show All');
    pulldown.setAttribute('style', 'position: absolute;');
    this.container.appendChild(pulldown);
    this.pulldownTrigger = pulldown;
    
    setTimeout(this.positionPulldownTrigger.bindAsEventListener(this), 50);
    
    Event.observe(this.element, 'dblclick', this.getAllChoices.bindAsEventListener(this));
    Event.observe(this.pulldownTrigger, 'click', this.pulldown.bindAsEventListener(this));
  },
  
  pulldown: function(event) {
    if (Element.getStyle(this.update, 'display') == 'none') {
      this.getAllChoices(event);
    } else {
      this.hide();
    }
  },
  
  positionPulldownTrigger: function() {
    pulldown_x = (this.element.positionedOffset().left + 
      this.element.getWidth() - 
      16) + 'px';
    pulldown_y = (this.pulldownTrigger.positionedOffset().top + 2) + 'px';
    
    this.pulldownTrigger.style.left = pulldown_x;
    this.pulldownTrigger.style.top = pulldown_y;
    
    this.pulldownTrigger = pulldown;
  },
  
  show: function() {
    if(Element.getStyle(this.update, 'display')=='none') this.options.onShow(this.element, this.update);
    if(!this.iefix && 
      (Prototype.Browser.IE) &&
      (Element.getStyle(this.update, 'position')=='absolute')) {
      new Insertion.After(this.update, 
       '<iframe id="' + this.update.id + '_iefix" '+
       'style="display:none;position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);" ' +
       'src="javascript:\'\';" frameborder="0" scrolling="no"></iframe>');
      this.iefix = $(this.update.id+'_iefix');
    }
    if(this.iefix) setTimeout(this.fixIEOverlapping.bind(this), 50);
    
    setTimeout(this.fixSize.bind(this), 50);
  },

  fixSize: function() {
    if (this.update.offsetWidth < 200)
      this.update.style.width = '200px';
    
    
    height = this.update.down('ul').offsetHeight
    if (200 > height && height > 0)
      this.update.style.height = height + 'px';
    else
      this.update.style.height = '200px';
  },

  getUpdatedChoices: function() {
    this.startIndicator();
    
    var entry = encodeURIComponent(this.options.paramName) + '=' + 
      encodeURIComponent(this.getToken());

    this.options.parameters = this.options.callback ?
      this.options.callback(this.element, entry) : entry;

    if(this.options.defaultParams) 
      this.options.parameters += '&' + this.options.defaultParams;
    
    new Ajax.Request(this.url, this.options);
  },
  
  getAllChoices: function(event) {
    this.startIndicator();

    if(this.options.defaultParams) 
      this.options.parameters += '&' + this.options.defaultParams;
    
    options2 = Object.clone(this.options);
    options2.parameters = null;
    new Ajax.Request(this.url, options2);
    
    this.changed = false;
    this.hasFocus = true;
    this.element.focus();
  },
  
  getMoreChoices: function(event) {
    this.startIndicator();
    
    options2 = Object.clone(this.options);
    options2.parameters = null;
    console.log(options2)
    new Ajax.Request(this.url, options2);
    
    this.changed = false;
    this.hasFocus = true;
  },
  
  updateElement: function(selectedElement) {
    if (this.options.updateElement) { // use override callback (if present)
      this.options.updateElement(selectedElement);
      return;
    }
    var value = '';
    
    id_value = Element.collectTextNodes($(selectedElement).down('span.id'));
    label_value = Element.collectTextNodes($(selectedElement).down('span.label'))
    
    this.element.value = label_value;
    this.id_field.value = id_value
    
    this.oldElementValue = this.element.value;
    this.element.focus();
    
    if (this.options.afterUpdateElement)
      this.options.afterUpdateElement(this.element, selectedElement);
  },

  onComplete: function(request) {
    data = JSON.parse(request.responseText);
    
    more = null;
    
    ul = "<ul class='autocomplete_list' style='width: 99%'>"
    
    data.each(function(entry){
      keys = []
      for (prop in entry)
        keys.push(prop);
      
      if (keys.length == 1 && typeof(entry[keys[0]]) == 'object')
        entry = entry[keys[0]]
      
      if (entry['id']) {
        ul += '<li class="autocomplete_item ' + entry['class_name'] + '">' +
        '<span class="code label">' + entry['to_s'] + '</span>' +
        '<span class="code-id id">' + entry['id'] + '</span>' +
        '</li>';
      } else if (entry['more']) {
        more = entry['more'];
      }
    })
    
    this.more = more;
    
    if (this.more) {
  		// FIXME: create an LI node for the next URL, then bind to it to
      //       Event.observe(more, 'click', this.getMoreChoices.bindAsEventListener(this));
  		ul += '<li class="autocomplete_item"><span class="more">More...</span></li>';
  	}
    
    ul += "</ul>"
    
    this.updateChoices(ul);
  },
  
  startIndicator: function() {
    if(this.options.indicator) Element.show(this.options.indicator);
    window.document.body.style.cursor = 'wait'
    this.element.style.cursor = 'wait'
    this.pulldownTrigger.style.cursor = 'wait'
  },

  stopIndicator: function() {
    if(this.options.indicator) Element.hide(this.options.indicator);
    window.document.body.style.cursor = null
    this.element.style.cursor = null
    this.pulldownTrigger.style.cursor = null
  }
});