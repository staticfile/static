<#macro comments commentList article>
<div class="row" id="comments">
    <#list commentList as comment>
    <div class="row comment" id="${comment.oId}">
        <img class="col-sm-1" title="${comment.commentName}"
             alt="${comment.commentName}" src="${comment.commentThumbnailURL}"/>
        <div class="col-sm-11">
            <div class="row">
                <#if "http://" == comment.commentURL>
                <a>${comment.commentName}</a>
                <#else>
                <a href="${comment.commentURL}" target="_blank">${comment.commentName}</a>
                </#if>
                <#if comment.isReply>@
                <a href="${servePath}${article.permalink}#${comment.commentOriginalCommentId}"
                   onmouseover="page.showComment(this, '${comment.commentOriginalCommentId}', 20);"
                   onmouseout="page.hideComment('${comment.commentOriginalCommentId}')">${comment.commentOriginalCommentName}</a>
                </#if>

                <span class="gray">• ${comment.commentDate?string("yy-MM-dd HH:mm")} • <#if article.commentable>
                    <a rel="nofollow" href="javascript:replyTo('${comment.oId}');">Reply</a>
                    </#if></span>

            </div>
            <div class="row code-highlight">${comment.commentContent}</div>
        </div>
    </div>
    </#list>
</div>

<#if article.commentable>
<div class="row cmtForm">
    <table id="commentForm" class="col-sm-12 form-horizontal">
        <tbody>
            <#if !isLoggedIn>
            <tr>
                <td>
                    <label for="commentName" class="col-sm-2 control-label">Name</label>
                </td>
                <td>
                    <input type="text" class="form-control" id="commentName" placeholder="Name"/>
                </td>
            </tr>
            <tr>
                <td>
                    <label for="commentName" class="col-sm-2 control-label">Email</label>
                </td>
                <td>
                    <input type="text" class="form-control" id="commentEmail" placeholder="Email"/>
                </td>
            </tr>
            <tr>
                <td>
                    <label for="commentName" class="col-sm-2 control-label">URL</label>
                </td>
                <td>
                    <input type="text" id="commentURL" placeholder="URL" class="form-control"/>
                </td>
            </tr>
            </#if>
            <tr>
                <td>&nbsp;</td>
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
                <td>&nbsp;</td>
                <td>
                    <textarea rows="3" id="comment" class="form-control"></textarea>
                </td>
            </tr>
            <#if !isLoggedIn>
            <tr>
                <td>&nbsp;</td>
                <td>
                    <form class="form-inline">
                        
                    <input type="text" id="commentValidate" class="form-control"/>
                    <img id="captcha" alt="validate" src="${servePath}/captcha.do" />
                    </form>
                </td>
            </tr>
            <#else>
             <tr colspan="2">
                <td>&nbsp;</td>
             </tr>
            </#if>
            <tr>
                <td align="right" colspan="2">
                    <span class="text-danger" id="commentErrorTip"></span>
                    <button class="btn btn-success" id="submitCommentButton" onclick="page.submitComment();">${submmitCommentLabel}</button>
                </td>
            </tr>
        </tbody>
    </table>
</div>

<#if externalRelevantArticlesDisplayCount?? && 0 != externalRelevantArticlesDisplayCount>
<div id="externalRelevantArticles" class="row article-relative"></div>
</#if>
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
                            "randomArticles1Label": "${randomArticlesLabel}",
                            "externalRelevantArticles1Label": "${externalRelevantArticlesLabel}"
                        });

                        var addComment = function (result, state) {
                            var commentHTML = '<div class="row comment" id="' + result.oId + '"><img class="col-sm-1" \
                                    title="' + result.userName + '" alt="' + result.userName +
                                    '" src="' + result.commentThumbnailURL
                                    + '"/><div class="col-sm-11"><div class="row">' + result.replyNameHTML;



//                            if (state !== "") {
//                                var commentOriginalCommentName = $("#" + page.currentCommentId
//                                        + " .comment-panel>.left a").first().text();
//                                commentHTML += '&nbsp;@&nbsp;<a href="${servePath}'
//                                        + result.commentSharpURL.split("#")[0] + '#' + page.currentCommentId + '"'
//                                        + 'onmouseover="page.showComment(this, \'' + page.currentCommentId + '\', 20);"'
//                                        + 'onmouseout="page.hideComment(\'' + page.currentCommentId + '\')">'
//                                        + commentOriginalCommentName + '</a>';
//                            }

                            commentHTML += '<span class="gray">•' + result.commentDate.substring(2, 16)
                                    + '• <a rel="nofollow" href="javascript:replyTo('
                                    + result.oId + ');">Reply</a></span></div><div class="row">' +
                            Util.replaceEmString($("#comment" + state).val()) + '</div>';

                            return commentHTML;
                        };

                        var replyTo = function (id) {
                            var commentFormHTML = "<table class='cmtReplyForm col-sm-12 form-horizontal' id='replyForm'>";
                            page.addReplyForm(id, commentFormHTML);
                            $("#replyForm label").each(function () {
                                $this = $(this);
                                $this.attr("for", $this.attr("for") + "Reply");
                            });
                        };

                        $(document).ready(function () {
                            page.load();
                            // emotions
                            page.replaceCommentsEm("#comments");
                            <#nested>
                        });
</script>
</#macro>
