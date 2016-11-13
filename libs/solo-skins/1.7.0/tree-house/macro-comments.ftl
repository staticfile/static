<#macro comments commentList article>
<div class="comments-header"></div>
<div class="comments marginTop12" id="comments">
    <#list commentList as comment>
    <div id="${comment.oId}" class="comment">
        <div class="comment-panel">
            <div class="comment-top"></div>
            <div class="comment-body">
                <div class="comment-title">
                    <#if "http://" == comment.commentURL>
                    <a name="${comment.oId}" class="left">${comment.commentName}</a>
                    <#else>
                    <a name="${comment.oId}" href="${comment.commentURL}"
                       target="_blank" class="left">${comment.commentName}</a>
                    </#if>
                    <#if comment.isReply>
                    &nbsp;@&nbsp;<a
                        href="${servePath}${article.permalink}#${comment.commentOriginalCommentId}"
                        onmouseover="page.showComment(this, '${comment.commentOriginalCommentId}', 17);"
                        onmouseout="page.hideComment('${comment.commentOriginalCommentId}')">${comment.commentOriginalCommentName}</a>
                    </#if>
                    <#if article.commentable>
                    <div class="right">
                        ${comment.commentDate?string("yyyy-MM-dd HH:mm:ss")}
                        <a rel="nofollow" class="no-underline"
                           href="javascript:replyTo('${comment.oId}');">${replyLabel}</a>
                    </div>
                    </#if>
                    <div class="clear"></div>
                </div>
                <div>
                    <img class="comment-picture left" alt="${comment.commentName}" src="${comment.commentThumbnailURL}"/>
                    <div class="comment-content">
                        ${comment.commentContent}
                    </div>
                    <div class="clear"></div>
                </div>
            </div>
            <div class="comment-bottom"></div>
        </div>
    </div>
    </#list>
</div>
<#if article.commentable>
<div class="comments">
    <div class="comment-top"></div>
    <div class="comment-body">
        <div class="comment-title">
            <a>${postCommentsLabel}</a>
        </div>
        <table id="commentForm" class="form">
            <tbody>
                <#if !isLoggedIn>
                <tr>
                    <th>
                        ${commentName1Label}
                    </th>
                    <td>
                        <input type="text" class="normalInput" id="commentName"/>
                    </td>
                </tr>
                <tr>
                    <th>
                        ${commentEmail1Label}
                    </th>
                    <td>
                        <input type="text" class="normalInput" id="commentEmail"/>
                    </td>
                </tr>
                <tr>
                    <th>
                        ${commentURL1Label}
                    </th>
                    <td>
                        <input type="text" id="commentURL"/>
                    </td>
                </tr>
                </#if>
                <tr>
                    <td id="emotions" colspan="2">
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
                        ${commentContent1Label}
                    </th>
                    <td>
                        <textarea rows="10" cols="96" id="comment"></textarea>
                    </td>
                </tr>
                <#if !isLoggedIn>
                <tr>
                    <th valign="top">
                        ${captcha1Label}
                    </th>
                    <td valign="top" style="min-width: 190px;">
                        <input type="text" class="normalInput" id="commentValidate"/>
                        <img id="captcha" alt="validate" src="${servePath}/captcha.do" />
                    </td>
                </tr>
                </#if>
                <tr>
                    <td colspan="2" align="right">
                        <span class="error-msg" id="commentErrorTip"></span>
                        <button id="submitCommentButton" onclick="page.submitComment();">${submmitCommentLabel}</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="comment-bottom"></div>
</div>
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
        var commentHTML = '<div id="' + result.oId + '" class="comment"><div class="comment-panel">'
            + '<div class="comment-top"></div><div class="comment-body"><div class="comment-title">' + result.replyNameHTML;

        if (state !== "") {
            var commentOriginalCommentName = $("#" + page.currentCommentId).find(".comment-title a").first().text();
            commentHTML += '&nbsp;@&nbsp;<a href="${servePath}' + result.commentSharpURL.split("#")[0] + '#' + page.currentCommentId + '"'
                + 'onmouseover="page.showComment(this, \'' + page.currentCommentId + '\', 17);"'
                + 'onmouseout="page.hideComment(\'' + page.currentCommentId + '\')">' + commentOriginalCommentName + '</a>';
        }

        commentHTML += '<div class="right">' + result.commentDate
            + '&nbsp;<a rel="nofollow" class="no-underline" href="javascript:replyTo(\'' + result.oId + '\');">${replyLabel}</a>'
            + '</div><div class="clear"></div></div><div><img alt="' + result.userName
            + '" src="' + result.commentThumbnailURL + '" class="comment-picture left"/>'
            + '<div class="comment-content">'
            + Util.replaceEmString($("#comment" + state).val())
            + '</div>'
            + ' <div class="clear"></div></div></div><div class="comment-bottom"></div></div></div>';

        return commentHTML;
    }

    var replyTo = function (id) {
        var commentFormHTML = "<div id='replyForm'><div class='comment-top'></div>"
            + "<div class='comment-body'><table class='form comment-reply'>";
                
        page.addReplyForm(id, commentFormHTML, "</div><div class='comment-bottom'></div></div>");
    };

    (function () {
        page.load();
        // emotions
        page.replaceCommentsEm("#comments .comment-content");
            <#nested>
        })();
</script>
</#macro>