<#include "macro-head.ftl">
<!DOCTYPE html>
<html>
    <head>
        <@head title="${allTagsLabel} - ${blogTitle}">
        <meta name="keywords" content="${metaKeywords},${allTagsLabel}"/>
        <meta name="description" content="<#list tags as tag>${tag.tagTitle}<#if tag_has_next>,</#if></#list>"/>
        </@head>
    </head>
    <body>
        <#include "header.ftl">

        <div class="container">
            <div class="row">
                <div class="col-sm-2"></div>

                <div class="col-sm-8 site">
                    <ul>
                        <#list tags as tag>
                        <li>
                            <a rel="tag" data-count="${tag.tagPublishedRefCount}"
                               href="${servePath}/tags/${tag.tagTitle?url('UTF-8')}" title="${tag.tagTitle}">
                                <span>${tag.tagTitle}</span>
                                (<b>${tag.tagPublishedRefCount}</b>)
                            </a>
                        </li>
                        </#list>
                    </ul>
                </div>
            </div>
            
            <div class="col-sm-2"></div>
        </div>
       
        <#include "footer.ftl">
    </body>
</html>
