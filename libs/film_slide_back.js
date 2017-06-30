function slide_css(obj, attr, value)
{
    if(arguments.length==2)
    {
        if(attr!='opacity')
        {
            return parseInt(obj.currentStyle?obj.currentStyle[attr]:document.defaultView.getComputedStyle(obj, false)[attr]);
        }
        else
        {
            return Math.round(100*parseFloat(obj.currentStyle?obj.currentStyle[attr]:document.defaultView.getComputedStyle(obj, false)[attr]));
        }
    }
    else if(arguments.length==3)
        switch(attr)
        {
            case 'width':
            case 'height':
            case 'paddingLeft':
            case 'paddingTop':
            case 'paddingRight':
            case 'paddingBottom':
                value=Math.max(value,0);
            case 'left':
            case 'top':
            case 'marginLeft':
            case 'marginTop':
            case 'marginRight':
            case 'marginBottom':
                obj.style[attr]=value+'px';
                break;
            case 'opacity':
                obj.style.filter="alpha(opacity:"+value+")";
                obj.style.opacity=value/100;
                break;
            case 'display':
                obj.style.display = 'block';
                break;
            default:
                obj.style[attr]=value;
        }

    return function (attr_in, value_in){slide_css(obj, attr_in, value_in)};
}

var MIAOV_MOVE_TYPE={
    BUFFER: 1,
    FLEX: 2
};

function miaovStopMove(obj)
{
    clearInterval(obj.timer);
}

function miaovStartMove(obj, oTarget, iType, fnCallBack, fnDuring)
{
    var fnMove=null;
    if(obj.timer)
    {
        clearInterval(obj.timer);
    }

    switch(iType)
    {
        case MIAOV_MOVE_TYPE.BUFFER:
            fnMove=miaovDoMoveBuffer;
            break;
        case MIAOV_MOVE_TYPE.FLEX:
            fnMove=miaovDoMoveFlex;
            break;
    }

    obj.timer=setInterval(function (){
        fnMove(obj, oTarget, fnCallBack, fnDuring);
    }, 30);
}

function miaovDoMoveBuffer(obj, oTarget, fnCallBack, fnDuring)
{
    var bStop=true;
    var attr='';
    var speed=0;
    var cur=0;

    for(attr in oTarget)
    {
        cur=slide_css(obj, attr);
        if(oTarget[attr]!=cur)
        {
            bStop=false;

            speed=(oTarget[attr]-cur)/5;
            speed=speed>0?Math.ceil(speed):Math.floor(speed);

            slide_css(obj, attr, cur+speed);
        }
    }

    if(fnDuring)fnDuring.call(obj);

    if(bStop)
    {
        clearInterval(obj.timer);
        obj.timer=null;

        if(fnCallBack)fnCallBack.call(obj);
    }
}

function miaovDoMoveFlex(obj, oTarget, fnCallBack, fnDuring)
{
    var bStop=true;
    var attr='';
    var speed=0;
    var cur=0;

    for(attr in oTarget)
    {
        if(!obj.oSpeed)obj.oSpeed={};
        if(!obj.oSpeed[attr])obj.oSpeed[attr]=0;
        cur=slide_css(obj, attr);
        if(Math.abs(oTarget[attr]-cur)>=1 || Math.abs(obj.oSpeed[attr])>=1)
        {
            bStop=false;

            obj.oSpeed[attr]+=(oTarget[attr]-cur)/5;
            obj.oSpeed[attr]*=0.7;

            slide_css(obj, attr, cur+obj.oSpeed[attr]);
        }
    }

    if(fnDuring)fnDuring.call(obj);

    if(bStop)
    {
        clearInterval(obj.timer);
        obj.timer=null;

        if(fnCallBack)fnCallBack.call(obj);
    }
}
function film_slide(num)
{
var oDiv=document.getElementById('tFocus');
var aPicLi=document.getElementById('tFocus-pic').getElementsByTagName('div');
var aTxtLi=document.getElementById('tFocus-text').getElementsByTagName('div');
var oIcoUl=document.getElementById('tFocus-btn').getElementsByTagName('div')[0];
var aIcoLi=document.getElementById('tFocus-btn').getElementsByTagName('a');
var oBtnPrev=document.getElementById('tFocus-leftbtn');
var oBtnNext=document.getElementById('tFocus-rightbtn');
var iNowUlLeft=0;
var iNow=0;
var i=0;
var nums = num ;

oBtnPrev.onclick=function ()
{
    if(iNowUlLeft>0)
    {
        iNowUlLeft--;
        fixUlLeft();
    }
};

function fixUlLeft()
{

   /* oBtnPrev.className=iNowUlLeft==0?'btn':'btn showBtn';
    oBtnNext.className=iNowUlLeft==(aIcoLi.length-7)?'btn':'btn showBtn';*/
    miaovStartMove(oIcoUl, {left: -aIcoLi[0].offsetWidth*iNowUlLeft }, MIAOV_MOVE_TYPE.BUFFER);
}

oBtnNext.onclick=function ()
{
    if(iNowUlLeft<aIcoLi.length-nums)
    {
        iNowUlLeft++;
        fixUlLeft();
    }
};

for(i=0;i<aIcoLi.length;i++)
{
    aIcoLi[i].index=i;
    aIcoLi[i].onmouseover=function ()
    {
        if(iNow==this.index)
        {
            return;
        }

        iNow=this.index;

        tab();
    };
}

function tab()
{
    for(i=0;i<aIcoLi.length;i++)
    {
        aIcoLi[i].className='';
        aTxtLi[i].style.display='none';
        //aPicLi[i].style.filter='alpha(opacity:0)';
        //aPicLi[i].style.opacity=0;
        aPicLi[i].style.display='none';
        miaovStopMove(aPicLi[i]);
    }
    aIcoLi[iNow].className='on';
    aTxtLi[iNow].style.display='block';
    miaovStartMove(aPicLi[iNow], {display: 'block'}, MIAOV_MOVE_TYPE.BUFFER);
}

function autoPlay()
{
    iNow++;

    if(iNow>=aIcoLi.length)
    {
        iNow=0;
    }

    if(iNow<iNowUlLeft)
    {
        iNowUlLeft=iNow;
    }
    else if(iNow>=iNowUlLeft+1)
    {
        iNowUlLeft=iNow-1;
    }

    fixUlLeft();
    tab();
}

var timer=setInterval(autoPlay, 3000);

oDiv.onmouseover=function ()
{
    clearInterval(timer);
};

oDiv.onmouseout=function ()
{
    timer=setInterval(autoPlay, 3000);
};
};
