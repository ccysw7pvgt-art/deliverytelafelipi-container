/* Google Ads events - configure seus IDs abaixo.
   Substitua AW-XXXXXXXXXX pelo ID da sua tag do Google Ads.
   Substitua os labels pelos labels reais das conversoes IC e Purchase.
*/
window.GOOGLE_ADS_CONVERSION_ID = window.GOOGLE_ADS_CONVERSION_ID || 'AW-XXXXXXXXXX';
window.GOOGLE_ADS_PAGE_LABEL = window.GOOGLE_ADS_PAGE_LABEL || 'COLE_O_LABEL_PAGE_AQUI';
window.GOOGLE_ADS_IC_LABEL = window.GOOGLE_ADS_IC_LABEL || 'COLE_O_LABEL_IC_AQUI';
window.GOOGLE_ADS_PURCHASE_LABEL = window.GOOGLE_ADS_PURCHASE_LABEL || 'COLE_O_LABEL_PURCHASE_AQUI';

(function(){
  var id = window.GOOGLE_ADS_CONVERSION_ID;
  if(!id || id === 'AW-XXXXXXXXXX'){
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ dataLayer.push(arguments); };
  } else {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', id, { send_page_view: true });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
  }

  function alreadySent(key){
    if(!key) return false;
    var full = 'google_ads_event_' + key;
    if(sessionStorage.getItem(full)) return true;
    sessionStorage.setItem(full, '1');
    return false;
  }

  window.siteTrack = function(eventName, params, eventId){
    params = params || {};
    var id = window.GOOGLE_ADS_CONVERSION_ID;
    if(!eventName) return;
    if(eventId && alreadySent(eventName + '_' + eventId)) return;

    if(typeof gtag === 'function'){
      if(eventName === 'PageView'){
        gtag('event', 'page_view', params);
        if(window.GOOGLE_ADS_PAGE_LABEL && window.GOOGLE_ADS_PAGE_LABEL !== 'COLE_O_LABEL_PAGE_AQUI'){
          gtag('event', 'conversion', { send_to: id + '/' + window.GOOGLE_ADS_PAGE_LABEL });
        }
        return;
      }
      if(eventName === 'InitiateCheckout'){
        gtag('event', 'conversion', {
          send_to: id + '/' + window.GOOGLE_ADS_IC_LABEL,
          value: Number(params.value || 0),
          currency: params.currency || 'BRL',
          transaction_id: eventId || ''
        });
        return;
      }
      if(eventName === 'Purchase'){
        gtag('event', 'conversion', {
          send_to: id + '/' + window.GOOGLE_ADS_PURCHASE_LABEL,
          value: Number(params.value || 0),
          currency: params.currency || 'BRL',
          transaction_id: eventId || ''
        });
        return;
      }
      gtag('event', eventName, params);
    }
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ window.siteTrack('PageView', {page_path: location.pathname}, location.pathname); });
  } else {
    window.siteTrack('PageView', {page_path: location.pathname}, location.pathname);
  }
})();
