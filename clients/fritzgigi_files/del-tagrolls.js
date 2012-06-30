/**
 * Delicious.Tagrolls
 * Renders the HTML for tagroll widgets.
 *
 * @package    delicious
 * @subpackage feeds
 * @author     lorchard
 */
if (typeof window.Delicious == 'undefined') window.Delicious = {};
Delicious.Tagrolls = function() {
    return {

        //! Default options used for render()
        defaults: {
            'BASE_URL':   'http://www.delicious.com',
            'STATIC_URL': 'http://www.delicious.com/static',

            title:   'My Delicious Tags',
            size:    '12-35',
            sort:    'alpha',
            color:   '73adff-3274d0', 
            flow:    'cloud',
            style:   'gradient',
            icon:    false,
            totals:  false,
            bullet:  false,
            name:    false,
            showadd: false,

            EOF:null
        },

        /**
         * 
         */
        writeln: function(o, posts) {
            document.write(this.render(o, posts));
        },

        render: function(o, tags) {

            var out = [];
            w = function (s) { out.push(s); }
            
            // Do some HTML escaping to avoid formatting probs and XSS
            o.title_h = this.htmlEscape(o.title);
            o.user_h  = this.htmlEscape(o.user);
            o.user_q  = encodeURIComponent(o.user);

            if (o.icon === true) o.icon = 's';

            // Apply default options to incoming options.
            for (k in this.defaults)
                if (typeof o[k] == 'undefined') 
                    o[k] = this.defaults[k];

            var size_parts  = o.size.split('-');
            var sizemin     = parseInt(size_parts[0]);
            var sizemax     = parseInt(size_parts[1]);

            var color_parts = o.color.split('-');
            var color_min   = this.clrfix(color_parts[0]);
            var color_max   = this.clrfix(color_parts[1]);

            var tags_out = [];
            for (name in tags) {
                if (!tags.hasOwnProperty(name)) continue;
                tags_out.push({
                    'name'  : this.htmlEscape(name), 
                    'uname' : encodeURIComponent(name),
                    'count' : tags[name] 
                });
            }

            // Sort the posts alphabetically if necessary.
            if (o.sort == 'alpha') {
                tags_out.sort(function(a,b) {
                    return ( (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 0 );
                });
            } else {
                tags_out.sort(function(b,a) {
                    return ( (a.count > b.count) ? 1 : (a.count < b.count) ? -1 : 0 );
                });
            }

            if (o.count)
                tags_out = tags_out.slice(0, parseInt(o.count));

            var count_min = null;
            var count_max = null;
            for (var i=0, tag_out; tag_out=tags_out[i]; i++) {
                var count = tag_out.count;
                if (count < count_min || count_min == null) 
                    count_min = count;
                if (count > count_max || count_max == null) 
                    count_max = count;
            }

            //default to all tags
            if (!o.count) o.count = i;

            var d_count = count_max - count_min + 1;
            for (var i=0, tag_out; tag_out=tags_out[i]; i++) {
                var count = tag_out.count;
                var d_curr_count = count - count_min + 1;

                if (sizemin && sizemax) {
                    tag_out['size'] = this.scaler(sizemin, sizemax, d_curr_count, d_count);
                }

                if (color_min && color_max) {
                    var clrs = [];
                    for (var c = 0; c < 3; c++) 
                        clrs[c] = this.scaler(color_min.rgb[c], color_max.rgb[c], d_curr_count, d_count)
                    tag_out['color'] = 'rgb('+clrs.join(',')+')';
                }

            }

            var flow_class = (o.flow == 'list') ?
                'delicious-list' : 'delicious-cloud';
                
            w('<div class="delicious-tags" id="delicious-tags-'+o.user_h+'">');

            // Include the blob of CSS if not disabled.
            if (o.style != 'none') {
                w('<style type="text/css"> .delicious-tags{font-family:arial,sans-serif} .delicious-tags a img{border:0;display:inline;margin:0 0 0 3px;padding:0} .delicious-tags a{text-decoration:none} .delicious-tags a:hover{text-decoration:underline} .delicious-tags ul{list-style-type:none;margin:0;padding:0; text-align:justify} .delicious-list li{display:block;margin:0;padding:0;background-image:none !important;} .delicious-list .delicious-tag-count{float:left;text-align:right} .delicious-cloud li{display:inline;text-align:justify;background-image:none !important;padding:0;margin:0} .delicious-cloud .delicious-tag-count{padding-left:0.2em;font-size:15px} .delicious-cloud li:before{content:"" !important} </style>'); 
            }

            if (o.title) w(this.renderTitle(o,w));

            w('<ul class="'+flow_class+'">');
            for (var i=0, tag; (i<=o.count) && (tag=tags_out[i]); i++) {
                w(this.renderTag(tag,o,w));
            }
            w('</ul>');
            
            if (o.name || o.showadd)
                w('<br />');

            if (o.name) 
                w(this.renderUserName(o,w));
            
            if (o.showadd) 
                w(this.renderNetworkAdd(o,w));

            w('</div>');

            return out.join('');
        },

        renderTitle: function(o,w) {
            w('<h2 class="delicious-banner sidebar-title">');
            if (o.icon)
                w('<a href="'+o.BASE_URL+'"><img src="'+o.STATIC_URL+'/img/delicious.med.gif" '+
                    'alt="delicious" width="16" height="16" /></a> ');
            w('<a href="'+o.BASE_URL+'/'+o.user+'">'+o.title+'</a>');
            w('</h2>');
        },

        renderTag: function(t,o,w) {

            w('<li>');

            if (o.flow=='list' && o.totals)
                w('<span class="delicious-tag-count" style="margin-right:'+(t['size']/2)+'px;'+
                    'font-size:12px;">'+t['count']+'</span> ');
            
            w('<a href="'+o.BASE_URL+'/'+o.user+'/'+t['uname']+'" '+
                'style="'+ 
                    (t['color'] ? 'color:'+t['color']+';' : '') +
                    (t['size']  ? 'font-size:'+t['size']+'px;' : '') +
                '" ' +
                'title="'+t['count']+' bookmarks">'+t['name']+'</a> ');
            
            if (o.flow=='cloud' && o.totals)
                w('<span class="delicious-tag-count" '+
                    'style="font-size:12px;">('+t['count']+')</span> ');
            
            w('</li> ');

        },

        renderUserName: function(o,w) {
            w('<span class="delicious-network-username">' + 
                this.getIcon(o, 'name', o.icon, o.user_h, o.user_q)+
                ' I am <a href="'+o.BASE_URL+'/'+o.user+'">'+o.user+'</a> '+
                'on <a href="'+o.BASE_URL+'">Delicious</a></span><br/>');
        },

        renderNetworkAdd: function(o,w) {
            w('<span class="delicious-network-add">'+
                this.getIcon(o, 'add', o.icon, 'delicious', "network?add="+o.user_q)+' ');
            w('<a href="'+o.BASE_URL+'/settings/networkedit?action=add&username='+o.user_q+'">'+
                'Add me to your '+((o.name)?'':'Delicious')+' network</a></span><br/>');
        },

        //! Icons by type and size, used by getIcon()
        icons: {
            logo: {
                's': [ 'delicious.small.gif', 10, 10 ]
            },
            name: {
                's': [ 'delicious.small.gif', 10, 10 ]
            },
            add: {
                's': [ 'add.small.gif', 10, 10]
            }
        },

        /**
         * Common method for generating linked icons based on the user-supplied
         * size crossed with the kind of icon needed.  Also ensures that the
         * del logo appears somewhere at least once, regardless of what icon
         * kind is preferred at any particular part of the markup.
         */
        getIcon: function(o, kind, size, alt, link) {
            if (!o.logo_shown) {
                o.logo_shown = true;
                kind = 'logo';
            }
            var ic = this.icons[kind] ? this.icons[kind][size] : null;
            if (!ic) {
                return '';
            } else {
                var out = '<img src="'+o.STATIC_URL+'/img/'+ic[0]+'" '+
                    'width="'+ic[1]+'" height="'+ic[2]+'" '+
                    'alt="'+alt+'" border="0" />';
                if (typeof link != 'undefined') 
                    out = '<a href="'+o.BASE_URL+'/'+link+'">'+out+'</a>';
                return out;
            }
        },

        scaler: function(min, max, i, iMax) {
            if(min>max){
                var m = (min-max)/Math.log(iMax)
                var scaled = min-Math.floor(Math.log(i) * m)
            } else {
                var m = (max-min)/Math.log(iMax)
                var scaled = Math.floor(Math.log(i) * m + min)
            }
            return scaled;
        },

        clrfix: function(raw) {
            c = raw.toLowerCase().replace(/ /g, '');
            var clr = '000000'
            var hex = c.match(/^#?([a-f0-9]{6})$/)
            var hexSm = c.match(/^#?([a-f0-9]{3})$/)

            if (hex) {
                clr = hex[1];
            } else if(hexSm) {
                clr = hexSm[1].charAt(0) + hexSm[1].charAt(0) + 
                    hexSm[1].charAt(1) + hexSm[1].charAt(1) + 
                    hexSm[1].charAt(2) + hexSm[1].charAt(2);
            } else if(SvgColors[c]) {
                clr = SvgColors[c];
            }

            var rgb = [parseInt(clr.substr(0,2),16), parseInt(clr.substr(2,2),16), parseInt(clr.substr(4,2),16)]
            
            return {'hex':clr, 'rgb':rgb, 'raw':raw}
        },

        /**
         * Apply rough HTML escaping to a string.
         */
        htmlEscape: function(s) {
            return (''+s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        },

        /**
         * Default content output method, overridden by supplying write option
         * to render().
         */
        write: function(s) {
            document.writeln(s);
        },

        EOF: null
    };
}();
