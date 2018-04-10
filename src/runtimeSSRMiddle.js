import MobileDetect from 'mobile-detect';
import render from './render';

export default function runtimeSSRMiddle({
  routes, renderFullPage, createApp, initialState, onRenderSuccess, timeout=6000, verbose=true
}) {
  return async (req, res, next) => {
    const isMobile = !!new MobileDetect(req.headers['user-agent']).mobile();
    const result = await render({
      url: req.url,
      env: { platform: (isMobile ? 'mobile' : 'pc') },
      routes,
      renderFullPage,
      createApp,
      initialState,
      onRenderSuccess,
      timeout,
      verbose
    });
    switch (result.code) {
      case 200:
        return res.end(result.html);
      case 302:
        return res.redirect(302, result.redirect);
      case 404:
        next();
        break;
      case 500:
        next(result.error);
        break;
      default:
        next();
        break;
    }
  };
}
