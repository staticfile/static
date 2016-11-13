<#macro comments commentList article>
<div id="comments">
    <#list commentList as comment>
    <div id="${comment.oId}">
        <img class="left" alt="${comment.commentName}" src="${comment.commentThumbnailURL}"/>
        <div class="comment-panel left">
            <div class="comment-top">
                <#if "http://" == comment.commentURL>
                <a>${comment.commentName}</a>
                <#else>
                <a href="${comment.commentURL}" target="_blank">${comment.commentName}</a>
                </#if>
                <#if comment.isReply>
                @
                <a href="${servePath}${article.permalink}#${comment.commentOriginalCommentId}"
                   onmouseover="page.showComment(this, '${comment.commentOriginalCommentId}', 11);"
                   onmouseout="page.hideComment('${comment.commentOriginalCommentId}')">
                    ${comment.commentOriginalCommentName}</a>
                </#if>
                ${comment.commentDate?string("yyyy-MM-dd HH:mm:ss")}
            </div>
            <div class="comment-content">
                ${comment.commentContent}
            </div>
            <div class="clear"></div>
            <#if article.commentable>
            <div class="reply">
                <a rel="nofollow" href="javascript:replyTo('${comment.oId}');">${replyLabel}</a>
            </div>
            </#if>
        </div>
        <div class="clear"></div>
    </div>
    </#list>
</div>
<#if article.commentable>
<div class="comment-title">
    ${postCommentsLabel}
</div>
<table id="commentForm" class="comment" cellpadding="0" cellspacing="0" width="100%">
    <tbody>
        <#if !isLoggedIn>
        <tr>
            <th width="200px">
                <span class="comment-label">
                    ${commentNameLabel}
                </span>
                <span class="arrow-right"></span>
            </th>
            <td>
                <input type="text" id="commentName"/>
            </td>
        </tr>
        <tr>
            <th>
                <span class="comment-label">
                    ${commentEmailLabel}
                </span>
                <span class="arrow-right"></span>
            </th>
            <td>
                <input type="text" id="commentEmail"/>
            </td>
        </tr>
        <tr>
            <th>
                <span class="comment-label">
                    ${commentURLLabel}
                </span>
                <span class="arrow-right"></span>
            </th>
            <td>
                <input type="text" id="commentURL"/>
            </td>
        </tr>
        </#if>
        <tr>
            <th>
                <span class="comment-label">
                    ${commentEmotionsLabel}
                </span>
                <span class="arrow-right"></span>
            </th>
            <td id="emotions">
                <span class="em00" title="${em00Label}"></span>
                <span class="em01" title="${em01Label}"></span>
                <span class="em02" title="${em02Label}"></span>
                <span class="em03" title="${em03Label}"></span>
                <span class="em04" title="${em04Label}"></span>
                <span class="em05" title="${em05Label}"></span>
                <span class="em06" title="${em06Label}"></span>
                <span class="em07" title="${em07Label}"></span>
                <span class="em08" title="${em08Label}"></span>
                <span class="em09" title="${em09Label}"></span>
                <span class="em10" title="${em10Label}"></span>
                <span class="em11" title="${em11Label}"></span>
                <span class="em12" title="${em12Label}"></span>
                <span class="em13" title="${em13Label}"></span>
                <span class="em14" title="${em14Label}"></span>
            </td>
        </tr>
        <tr>
            <th valign="top">
                <span class="comment-label">
                    ${commentContentLabel}
                </span>
                <span class="arrow-right"></span>
            </th>
            <td>
                <textarea rows="10" id="comment"></textarea>
            </td>
        </tr>
        <#if !isLoggedIn>
        <tr>
            <th>
                <span class="comment-label">
                    ${captchaLabel}
                </span>
                <span class="arrow-right"></span>
            </th>
            <td>
                <input type="text" id="commentValidate"/>
                <img id="captcha" alt="validate" src="${servePath}/captcha.do" />
            </td>
        </tr>
        </#if>
        <tr>
            <td colspan="2">
                <span style="margin-top: 20px;" class="right error-msg" id="commentErrorTip"></span>
                <input id="submitCommentButton" type="button" onclick="page.submitComment();" value="${submmitCommentLabel}"/>
            </td>
        </tr>
    </tbody>
</table>
</#if>
</#macro>

<#macro comment_script oId>
<script type="text/javascript" src="${staticServePath}/js/page${miniPostfix}.js?${staticResourceVersion}" charset="utf-8"></script>
<script type="text/javascript">
    var page = new Page({
        "nameTooLongLabel": "${nameTooLongLabel}",
        "mailCannotEmptyLabel": "${mailCannotEmptyLabel}",
        "mailInvalidLabel": "${mailInvalidLabel}",
        "commentContentCannotEmptyLabel": "${commentContentCannotEmptyLabel}",
        "captchaCannotEmptyLabel": "${captchaCannotEmptyLabel}",
        "captchaErrorLabel": "${captchaErrorLabel}",
        "loadingLabel": "${loadingLabel}",
        "oId": "${oId}",
        "skinDirName": "${skinDirName}",
        "blogHost": "${blogHost}",
        "randomArticles1Label": "${randomArticles1Label}",
        "externalRelevantArticles1Label": "${externalRelevantArticles1Label}"
    });

    var addComment = function (result, state) {
        var commentHTML = '<div id="' + result.oId + '">'
            + '<img class="left" alt="' + result.userName + '" src="' + result.commentThumbnailURL
            + '"/><div class="comment-panel left"><div class="comment-top">' + result.replyNameHTML;

        if (state !== "") {
            var commentOriginalCommentName = $("#" + page.currentCommentId + " .comment-top a").first().text();
            commentHTML += '&nbsp;@&nbsp;<a href="${servePath}' + result.commentSharpURL.split("#")[0] + '#' + page.currentCommentId + '"'
                + 'onmouseover="page.showComment(this, \'' + page.currentCommentId + '\', 11);"'
                + 'onmouseout="page.hideComment(\'' + page.currentCommentId + '\')">' + commentOriginalCommentName + '</a>';
        }

        commentHTML += '&nbsp;' + result.commentDate
            + '</div><div class="comment-content">' + Util.replaceEmString($("#comment" + state).val())
            + '</div><div class="clear"></div><div class="reply"><a rel="nofollow" href="javascript:replyTo(\'' + result.oId + '\');">${replyLabel}</a>'
            + '</div></div><div class="clear"></div></div>';

        return commentHTML;
    }

    var replyTo = function (id) {
        var commentFormHTML = "<table width='100%' cellspacing='0' cellpadding='0' class='comment' id='replyForm'>";
        page.addReplyForm(id, commentFormHTML);
    };

    (function () {
        page.load();
        page.replaceCommentsEm("#comments .comment-content");
            <#nested>
        })();
</script>
</#macro>