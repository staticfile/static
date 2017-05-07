<#include "macro-head.ftl">
<#include "macro-comments.ftl">
<!DOCTYPE html>
<html>
    <head>
        <@head title="${page.pageTitle} - ${blogTitle}">
        <meta name="keywords" content="${metaKeywords},${page.pageTitle}" />
        <meta name="description" content="${metaDescription}" />
        </@head>
    </head>
    <body>
        ${topBarReplacement}
        <#include "header.ftl">
        <div class="wrapper">
            <div class="container">
                <div class="module">
                    <div class="article-body">
                        ${page.pageContent}
                    </div>
                    <@comments commentList=pageComments article=page></@comments>
                </div>
            </div>
        </div> 
        <#include "footer.ftl">
        <@comment_script oId=page.oId></@comment_script>
    </body>
</html>
