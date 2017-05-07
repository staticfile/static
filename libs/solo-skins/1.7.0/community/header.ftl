<#if 1 != users?size>
<div class="header-user">
    <div class="content">
        <div class="moon-current-icon"></div>
        <#list users as user>
        <a class="star-icon" href="${servePath}/authors/${user.oId}">
            ${user.userName}
        </a>
        </#list>
        <div class="clear"></div>
    </div>
</div>
</#if>
<div class="header-navi">
    <div class="header-navi-main content">
        <div class="left">
            <a rel="nofollow" href="${servePath}" class="header-title">
                ${blogTitle}
            </a>
            <span class="sub-title">${blogSubtitle}</span>
        </div>
        <div class="right">
            <ul class="tabs">
                <li class="tab">
                    <a href="${servePath}">${homeLabel}</a>
                </li>
                <li class="tab">
                    <a href="${servePath}/tags.html">${allTagsLabel}</a>
                </li>
                <#if 0 != pageNavigations?size>
                <li class="tab" id="header-pages">
                    <a href="${servePath}">
                        <span class="left">
                            ${pageLabel}
                        </span>
                        <span class="arrow-dowm-icon"></span>
                        <span class="clear"></span>
                    </a>
                    <ul class="sub-tabs none">
                        <#list pageNavigations as page>
                        <li class="sub-tab">
                            <a href="${page.pagePermalink}" target="${page.pageOpenTarget}">${page.pageTitle}</a>
                        </li>
                        </#list>
                    </ul>
                </li>
                </#if>
                <li class="tab">
                    <a rel="alternate" href="${servePath}/blog-articles-rss.do">
                        <span class="left">RSS</span>
                        <span class="atom-icon"></span>
                        <span class="clear"></span>
                    </a>
                </li>
            </ul>
        </div>
        <div class="clear"></div>
    </div>
</div>