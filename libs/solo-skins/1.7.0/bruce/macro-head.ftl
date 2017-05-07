<#macro head title>
<meta charset="utf-8" />
<title>${title}</title>
<#nested>
<meta name="author" content="${blogTitle?html}" />
<meta name="generator" content="B3log Solo" />
<meta name="copyright" content="B3log" />
<meta name="owner" content="B3log Team" />
<meta name="revised" content="${blogTitle?html}, ${year}" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=yes" />
<meta http-equiv="Window-target" content="_top" />
<link type="text/css" rel="stylesheet" href="${staticServePath}/skins/${skinDirName}/css/bootstrap${miniPostfix}.css?${staticResourceVersion}" charset="utf-8" />
<link type="text/css" rel="stylesheet" href="${staticServePath}/skins/${skinDirName}/css/${skinDirName}${miniPostfix}.css?${staticResourceVersion}" charset="utf-8" />
<link href="${servePath}/blog-articles-rss.do" title="RSS" type="application/rss+xml" rel="alternate" />
<link rel="icon" type="image/png" href="${servePath}/favicon.png" />
${htmlHead}
</#macro>