	var adhtml='<div class="game_time" id="adtime"><div class="hold"><div class="pie pie1"></div></div><div class="hold"><div class="pie pie2"></div></div><div class="bg"> </div><div class="adtime"></div></div>';
	function yzcmOver(){
		//加载完成后验证是否已经打赏过 打赏是否过期
		var Id = localStorage.getItem('$Id');
		var Cami_Num = localStorage.getItem('$Cami_Num');
		if(!Id||!Cami_Num){
			sshow();
			return ;
		}else{
			$("#yzcm").val(Cami_Num);
			$.ajax({
				type: 'get',
				url: "http://www.kn321.com/?s=api-Cami-cm-CamiNum-"+Cami_Num,
				timeout: 5000,
				error: function(){
					//alert('免提密钥验证失败，请联系我们...');
					sshow();
					return ;
				},
				success:function(rs){
					//错误
					rs =eval("(" + rs + ")");
					if(rs.rscm.length<=0){
						sshow();
						return ;
					}else{//成功
						var cm =rs.rscm[0];
						var Cami_User = cm.Cami_User;
						var ServerTime = cm.ServerTime;
						    if(ServerTime){ServerTime = new Date(ServerTime.replace(/-/g,"/"));}
						var Cami_OverdueTime = cm.Cami_OverdueTime;
							if(Cami_OverdueTime){Cami_OverdueTime = new Date(Cami_OverdueTime.replace(/-/g,"/"));}
						var Cami_State = cm.Cami_State;
						for(var key in cm)
						{
							localStorage.setItem('$'+key, cm[key]);
						}
						if(Cami_State!==""){	   
					    	if(Cami_State==4){
					    		alert("很抱歉您的打赏密钥已禁用！");
					    		sshow();
								return ;
					    	}else if(Cami_State==0){
					    		alert("很抱歉您的打赏密钥未被系统启用！请联系我们！");
					    		sshow();
								return ;
					    	}else if(Cami_State==3){
					    		alert("您很久没有打赏了，您是否给本站打赏点碎银呢？");
								sshow();
								return ;
					    	}else if(Cami_State!=2){
					    		alert("或许您已经打赏，但发生了其它错误，请联系我们！");
								sshow();
								return ;
					    	}if(Cami_OverdueTime&&Cami_OverdueTime<ServerTime){	    	
								alert("您很久没有打赏了，您是否给本站打赏点碎银呢？");
								sshow();
								return ;
						    }
							
					    }	
						
					}
					
				}
			});
			
		}
		
		
		
    }
	
    
	function sshow(){
		$("#cy-reward-pop").append(adhtml);
		//弹出打赏框
		showMaskzz();
		$("#cy-reward-pop").css("display","block");
		$("#cy-reward-pop").css("z-index","9999999");
		gameTime=10;
		countDown();
		
	}
			
	function yzcm(){
		var cmVal = $("#yzcm").val();
		if(!cmVal||$("#yzcm").val().trim().length<=0){alert("请填写免提密钥再确认！！")}
		$.ajax({
					type: 'get',
					url: "http://www.kn321.com/?s=api-Cami-cm-CamiNum-"+cmVal,
					timeout: 5000,
					error: function(){
						alert('免提密钥验证失败，请联系我们...');
						return ;
					},
					success:function(rs){
						//错误
						rs =eval("(" + rs + ")");
						if(rs.rscm.length<=0){
							alert("验证无效！如有疑问！请联系我们！");
							return ;
						}else{
							//错误
							if(rs.rscm.length<=0){
								alert("没有查询到验证信息！如有疑问！请联系我们！");
								return ;
							}else{//成功
								var cm =rs.rscm[0];
								var Cami_User = cm.Cami_User;
								var ServerTime = cm.ServerTime;
								    if(ServerTime){ServerTime = new Date(ServerTime.replace(/-/g,"/"));}
								var Cami_OverdueTime = cm.Cami_OverdueTime;
									if(Cami_OverdueTime){Cami_OverdueTime = new Date(Cami_OverdueTime.replace(/-/g,"/"));}
								var Cami_State = cm.Cami_State;
								for(var key in cm)
								{
									localStorage.setItem('$'+key, cm[key]);
								}
								if(Cami_State!==""){	   
							    	if(Cami_State==4){
							    		alert("很抱歉您的打赏密钥已禁用！");
										return ;
							    	}else if(Cami_State==0){
							    		alert("很抱歉您的打赏密钥未被系统启用！请联系我们！");
										return ;
							    	}else if(Cami_State==3){
							    		alert("您很久没有打赏了，您是否给本站打赏点碎银呢？");
										return ;
							    	}else if(Cami_State!=2){
							    		alert("或许您已经打赏，但发生了其它错误，请联系我们！");
										return ;
							    	}else  if(Cami_OverdueTime&&Cami_OverdueTime<ServerTime){	    	
										alert("您很久没有打赏了，您是否给本站打赏点碎银呢？");
										return ;
								    }else if(Cami_State==2){
							    		alert("谢谢您的打赏，谢谢您对我的支持，我会更努力的！");
										return ;
							    	}
									
							    }else{
							    	alert("验证信息发生错误！如有疑问！请联系我们！！");
									return ;
							    }	
								
							}
							
						}
						
					}
				});
		
	}
