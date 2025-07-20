(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const s of a)if(s.type==="childList")for(const n of s.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&i(n)}).observe(document,{childList:!0,subtree:!0});function t(a){const s={};return a.integrity&&(s.integrity=a.integrity),a.referrerPolicy&&(s.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?s.credentials="include":a.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(a){if(a.ep)return;a.ep=!0;const s=t(a);fetch(a.href,s)}})();class M{constructor(){this.A_STOCK_CONSTRAINTS={maxDailyTrades:1,tradingDaysPerMonth:21,tradingDaysPerYear:250,minPositionSize:.01,maxPositionSize:1}}preprocessAndValidate(e){const t={initialCapital:e.initialCapital,targetAmount:e.targetAmount,dailyTrades:Math.min(e.dailyTrades,this.A_STOCK_CONSTRAINTS.maxDailyTrades),positionSize:Math.max(.01,Math.min(1,e.positionSize)),winRate:e.winRate,avgProfitRate:e.avgProfitRate,avgLossRate:e.avgLossRate};t.tradingCosts={commission:3e-4,stampTax:.001,transferFee:2e-5,totalCost:.00132},t.expectedReturn=t.winRate*t.avgProfitRate-(1-t.winRate)*t.avgLossRate-t.tradingCosts.totalCost;const i=t.avgProfitRate/t.avgLossRate,a=t.winRate,s=1-a;t.kellyOptimalPosition=Math.max(0,Math.min(.25,(i*a-s)/i));const n=this.validateParameters(t);return{params:t,validation:n}}validateParameters(e){const t=[],i=[];return e.expectedReturn<=0&&t.push({type:"critical",message:`期望收益率为${(e.expectedReturn*100).toFixed(3)}%，无法达到目标`,suggestion:"提高胜率或盈利率，或降低亏损率"}),e.positionSize>e.kellyOptimalPosition*2&&i.push({type:"warning",message:"当前仓位过大，建议降低至"+(e.kellyOptimalPosition*100).toFixed(1)+"%",suggestion:"过大仓位会增加破产风险"}),e.winRate>.8&&e.avgProfitRate<.02&&i.push({type:"warning",message:"高胜率配低收益率的组合不常见",suggestion:"请检查参数是否符合实际交易情况"}),{isValid:t.length===0,issues:t,warnings:i,riskLevel:this.assessInitialRisk(e)}}assessInitialRisk(e){let t=0;return e.expectedReturn<.001?t+=3:e.expectedReturn<.005&&(t+=1),e.positionSize>.5?t+=3:e.positionSize>.3&&(t+=1),e.winRate<.4?t+=2:e.winRate<.5&&(t+=1),t>=5?"very-high":t>=3?"high":t>=1?"medium":"low"}}class z{constructor(e){this.engine=e}async runSimulation(e,t={}){const{minIterations:i=500,maxIterations:a=2e3}=t,s=[];for(let n=0;n<i;n++){const o=this.simulateSinglePath(e);s.push(o)}return this.analyzeResults(s,e)}simulateSinglePath(e){let t=e.initialCapital,i=0,a=0,s=t,n=0,o=0;const l=2e4,r=e.initialCapital*.05;for(;t<e.targetAmount&&i<l&&t>r;){for(let d=0;d<e.dailyTrades;d++){const c=t*e.positionSize,p=Math.random()<e.winRate;let v;p?(v=e.avgProfitRate*(.8+.4*Math.random()),n=0):(v=-e.avgLossRate*(.8+.4*Math.random()),n++,o=Math.max(o,n)),t+=c*v,t-=c*e.tradingCosts.totalCost,t>s&&(s=t);const y=(s-t)/s;if(a=Math.max(a,y),t<=r)break}i++}return{success:t>=e.targetAmount,tradingDays:i,finalCapital:t,maxDrawdown:a,maxConsecutiveLosses:o,bankrupted:t<=r}}analyzeResults(e,t){const i=e.filter(o=>o.success);if(i.length===0)return{success:!1,reason:"所有模拟路径都未能达到目标",successRate:0};const a=i.map(o=>o.tradingDays),s=i.map(o=>o.finalCapital),n=e.map(o=>o.maxDrawdown);return a.sort((o,l)=>o-l),{success:!0,successRate:i.length/e.length,statistics:{mean:this.calculateMean(a),median:this.calculateMedian(a),p25:a[Math.floor(a.length*.25)],p75:a[Math.floor(a.length*.75)],min:Math.min(...a),max:Math.max(...a)},expectedFinalCapital:this.calculateMean(s),riskMetrics:{maxDrawdown:this.calculateMean(n),bankruptcyRate:e.filter(o=>o.bankrupted).length/e.length},riskLevel:this.assessRiskLevel(i.length/e.length),confidence:.95}}calculateMean(e){return e.reduce((t,i)=>t+i,0)/e.length}calculateMedian(e){const t=[...e].sort((a,s)=>a-s),i=Math.floor(t.length/2);return t.length%2===0?(t[i-1]+t[i])/2:t[i]}assessRiskLevel(e){return e<.5?"very-high":e<.7?"high":e<.9?"medium":"low"}}class B{constructor(){this.isCustom=!1,this.customDifficulties=this.getDefaultDifficulties(),this.loadFromStorage()}getDefaultDifficulties(){return{"initialCapital_50%":5,"initialCapital_100%":7,"initialCapital_200%":9,"profitRate_8%":6,"profitRate_9%":7,"profitRate_10%":8,"winRate_70%":6,"winRate_75%":7,"winRate_80%":8,"lossRate_1.5%":6,"lossRate_1%":7,"positionSize_45%":7,"positionSize_50%":8}}getDifficultyConfig(){return[{key:"initialCapital_50%",label:"增加50%初始本金",description:"例如：从10万增加到15万",category:"资金相关"},{key:"initialCapital_100%",label:"翻倍初始本金",description:"例如：从10万增加到20万",category:"资金相关"},{key:"profitRate_8%",label:"提升盈利率到8%",description:"通过学习提高交易技巧",category:"技能相关"},{key:"profitRate_10%",label:"提升盈利率到10%",description:"达到较高的交易水平",category:"技能相关"},{key:"winRate_70%",label:"提升胜率到70%",description:"提高交易成功率",category:"技能相关"},{key:"winRate_80%",label:"提升胜率到80%",description:"达到很高的胜率水平",category:"技能相关"},{key:"lossRate_1.5%",label:"降低亏损率到1.5%",description:"更好的风险控制",category:"风险控制"},{key:"positionSize_50%",label:"提升仓位到50%",description:"承担更高的资金风险",category:"风险控制"}]}setDifficulty(e,t){this.customDifficulties[e]=t,this.saveToStorage()}getDifficulty(e){return this.customDifficulties[e]||5}setCustomMode(e){this.isCustom=e,this.saveToStorage()}resetToDefault(){this.customDifficulties=this.getDefaultDifficulties(),this.isCustom=!1,this.saveToStorage()}saveToStorage(){try{localStorage.setItem("userDifficultyProfile",JSON.stringify({isCustom:this.isCustom,customDifficulties:this.customDifficulties}))}catch(e){console.warn("无法保存用户配置到本地存储:",e)}}loadFromStorage(){try{const e=localStorage.getItem("userDifficultyProfile");if(e){const t=JSON.parse(e);this.isCustom=t.isCustom||!1,this.customDifficulties={...this.getDefaultDifficulties(),...t.customDifficulties}}}catch(e){console.warn("无法从本地存储加载用户配置:",e)}}difficultyToFeasibility(e){return Math.max(.1,(11-e)/10)}}class W{constructor(){this.currentTool=null,this.tools={trading:null},window.financialApp=this,this.initializeApp()}initializeApp(){const e=document.querySelector("#app");e.innerHTML=this.createMainPageHTML(),this.bindMainPageEvents()}createMainPageHTML(){return`
      <!-- 主页面 -->
      <div id="mainPage" class="main-page">
        <div class="main-header">
          <h1>💰 财富自由工具箱</h1>
          <p>智能财富规划工具集，助您科学规划财富自由之路</p>
        </div>

        <div class="tools-grid">
          <!-- 交易投资财富自由计算器 -->
          <div class="tool-card" data-tool="trading">
            <div class="tool-icon">📈</div>
            <div class="tool-content">
              <h3>交易投资财富自由计算器</h3>
              <p>通过股票交易投资计算达到财富自由目标需要的时间</p>
              <div class="tool-features">
                <span class="feature-tag">蒙特卡洛模拟</span>
                <span class="feature-tag">个性化推荐</span>
                <span class="feature-tag">智能分析</span>
              </div>
              <button class="tool-btn">开始使用</button>
            </div>
          </div>

          <!-- 工资财富自由计算器 -->
          <div class="tool-card" data-tool="salary">
            <div class="tool-icon">💼</div>
            <div class="tool-content">
              <h3>工资财富自由计算器</h3>
              <p>通过工资储蓄和投资计算财富自由时间</p>
              <div class="tool-features">
                <span class="feature-tag">多阶段涨薪</span>
                <span class="feature-tag">投资收益</span>
                <span class="feature-tag">实用导向</span>
              </div>
              <button class="tool-btn">开始使用</button>
            </div>
          </div>

          <!-- 利息计算器 -->
          <div class="tool-card" data-tool="interest">
            <div class="tool-icon">🏦</div>
            <div class="tool-content">
              <h3>智能利息计算器</h3>
              <p>计算不同金额和利率下的利息收益</p>
              <div class="tool-features">
                <span class="feature-tag">实时计算</span>
                <span class="feature-tag">多时间维度</span>
                <span class="feature-tag">复利计算</span>
              </div>
              <button class="tool-btn">开始使用</button>
            </div>
          </div>

          <!-- 工作价值计算器 -->
          <div class="tool-card" data-tool="jobworth">
            <div class="tool-icon">💼</div>
            <div class="tool-content">
              <h3>这个班值不值得上计算器</h3>
              <p>全面评估工作的真实价值，不只是薪资那么简单</p>
              <div class="tool-features">
                <span class="feature-tag">PPP转换</span>
                <span class="feature-tag">多维评估</span>
                <span class="feature-tag">国际对比</span>
              </div>
              <button class="tool-btn">开始使用</button>
            </div>
          </div>

          <!-- 更多工具占位符 -->
          <div class="tool-card coming-soon">
            <div class="tool-icon">🔧</div>
            <div class="tool-content">
              <h3>更多工具</h3>
              <p>更多财富规划工具正在开发中...</p>
              <div class="tool-features">
                <span class="feature-tag">敬请期待</span>
              </div>
              <button class="tool-btn" disabled>开发中</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具容器 -->
      <div id="toolContainer" class="tool-container hidden">
        <div class="tool-header">
          <button id="backToMain" class="back-btn">
            <span class="back-icon">←</span>
            <span class="back-text">返回工具箱</span>
          </button>
          <div id="toolTitle" class="tool-title"></div>
        </div>
        <div id="toolContent" class="tool-content"></div>
      </div>
    `}bindMainPageEvents(){document.querySelectorAll(".tool-card[data-tool]").forEach(e=>{e.addEventListener("click",t=>{const i=e.dataset.tool;this.openTool(i)})}),document.getElementById("backToMain").addEventListener("click",()=>{this.backToMainPage()})}openTool(e){const t=document.getElementById("mainPage"),i=document.getElementById("toolContainer"),a=document.getElementById("toolTitle"),s=document.getElementById("toolContent");switch(t.classList.add("hidden"),i.classList.remove("hidden"),e){case"trading":a.textContent="交易投资财富自由计算器",this.loadTradingCalculator(s);break;case"interest":a.textContent="智能利息计算器",this.loadInterestCalculator(s);break;case"salary":a.textContent="工资财富自由计算器",this.loadSalaryCalculator(s);break;case"jobworth":a.textContent="这个班值不值得上计算器",s.innerHTML=`
          <div class="job-worth-form">
            <!-- 基础薪资信息 -->
            <div class="form-section">
              <h3>💰 薪资信息</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="jobSalary">年薪</label>
                  <input type="number" id="jobSalary" placeholder="请输入年薪">
                </div>
                <div class="form-group">
                  <label for="jobCountry">工作国家/地区</label>
                  <select id="jobCountry">
                    <option value="CN">中国 (PPP: 4.19)</option>
                    <option value="US">美国 (PPP: 1.00)</option>
                    <option value="JP">日本 (PPP: 102.84)</option>
                    <option value="KR">韩国 (PPP: 870.00)</option>
                    <option value="SG">新加坡 (PPP: 1.35)</option>
                    <option value="HK">香港 (PPP: 6.07)</option>
                    <option value="TW">台湾 (PPP: 28.50)</option>
                    <option value="GB">英国 (PPP: 0.70)</option>
                    <option value="DE">德国 (PPP: 0.75)</option>
                    <option value="FR">法国 (PPP: 0.73)</option>
                    <option value="AU">澳大利亚 (PPP: 1.47)</option>
                    <option value="CA">加拿大 (PPP: 1.21)</option>
                    <option value="IN">印度 (PPP: 21.99)</option>
                    <option value="TH">泰国 (PPP: 10.50)</option>
                    <option value="MY">马来西亚 (PPP: 1.70)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 工作时间 -->
            <div class="form-section">
              <h3>⏰ 工作时间</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="workDaysPerWeek">每周工作天数</label>
                  <input type="number" id="workDaysPerWeek" value="5" min="1" max="7">
                </div>
                <div class="form-group">
                  <label for="workHoursPerDay">每日工作小时</label>
                  <input type="number" id="workHoursPerDay" value="8" min="1" max="24" step="0.5">
                </div>
                <div class="form-group">
                  <label for="commuteHours">每日通勤小时</label>
                  <input type="number" id="commuteHours" value="1" min="0" max="8" step="0.5">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="wfhDays">每周远程天数</label>
                  <input type="number" id="wfhDays" value="0" min="0" max="7">
                </div>
                <div class="form-group">
                  <label for="restTime">每日休息时间</label>
                  <input type="number" id="restTime" value="0" min="0" max="4" step="0.5">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="annualLeave">年假天数</label>
                  <input type="number" id="annualLeave" value="5" min="0" max="30">
                </div>
                <div class="form-group">
                  <label for="paidSickLeave">带薪病假天数</label>
                  <input type="number" id="paidSickLeave" value="0" min="0" max="20">
                </div>
                <div class="form-group">
                  <label for="publicHolidays">法定假期天数</label>
                  <input type="number" id="publicHolidays" value="11" min="0" max="30">
                </div>
              </div>
            </div>

            <!-- 工作环境 -->
            <div class="form-section">
              <h3>🏢 工作环境</h3>

              <!-- 地理位置 -->
              <div class="environment-subsection">
                <h4>📍 地理位置</h4>
                <div class="form-row">
                  <div class="form-group">
                    <label for="cityLevel">城市等级</label>
                    <select id="cityLevel">
                      <option value="0.70">一线城市</option>
                      <option value="0.80">新一线城市</option>
                      <option value="1.0" selected>二线城市</option>
                      <option value="1.10">三线城市</option>
                      <option value="1.25">四线城市</option>
                      <option value="1.40">县城</option>
                      <option value="1.50">乡镇</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="hometown">是否在家乡工作</label>
                    <select id="hometown">
                      <option value="no" selected>不在家乡</option>
                      <option value="yes">在家乡</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- 工作环境 -->
              <div class="environment-subsection">
                <h4>🏭 工作环境</h4>
                <div class="form-group">
                  <label for="workEnvironment">工作环境类型</label>
                  <select id="workEnvironment">
                    <option value="0.8">偏僻的工厂/工地/户外</option>
                    <option value="0.9">工厂/工地/户外</option>
                    <option value="1.0" selected>普通环境</option>
                    <option value="1.1">CBD</option>
                  </select>
                </div>
              </div>

              <!-- 人际关系 -->
              <div class="environment-subsection">
                <h4>👥 人际关系</h4>
                <div class="form-row">
                  <div class="form-group">
                    <label for="leadership">领导/老板</label>
                    <select id="leadership">
                      <option value="0.7">对我不爽</option>
                      <option value="0.9">管理严格</option>
                      <option value="1.0" selected>中规中矩</option>
                      <option value="1.1">普通人缘</option>
                      <option value="1.3">我是爆亲</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="teamwork">同事环境</label>
                    <select id="teamwork">
                      <option value="0.9">都是傻逼</option>
                      <option value="1.0" selected>冲水柜道</option>
                      <option value="1.1">和谐融洽</option>
                      <option value="1.2">私交甚好</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- 福利待遇 -->
            <div class="form-section">
              <h3>🎁 福利待遇</h3>

              <!-- 班车服务 -->
              <div class="welfare-subsection">
                <h4>🚌 班车服务</h4>
                <div class="form-group">
                  <label for="shuttleBus">班车便利度</label>
                  <select id="shuttleBus">
                    <option value="0.8">无法抵达</option>
                    <option value="0.9">班车不便</option>
                    <option value="1.0" selected>便利班车</option>
                    <option value="1.1">班车直达</option>
                  </select>
                </div>
              </div>

              <!-- 食堂情况 -->
              <div class="welfare-subsection">
                <h4>🍽️ 食堂情况</h4>
                <div class="form-group">
                  <label for="cafeteria">食堂质量</label>
                  <select id="cafeteria">
                    <option value="0.8">无法抵达</option>
                    <option value="0.9">冲水柜道</option>
                    <option value="1.0" selected>和谐融洽</option>
                    <option value="1.1">私交甚好</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 个人背景 -->
            <div class="form-section">
              <h3>🎓 个人背景</h3>

              <!-- 学历系统优化 -->
              <div class="education-section">
                <h4>📚 学历背景</h4>
                <div class="form-row">
                  <div class="form-group">
                    <label for="degreeType">学位类型</label>
                    <select id="degreeType">
                      <option value="belowBachelor">专科及以下</option>
                      <option value="bachelor" selected>本科</option>
                      <option value="masters">硕士</option>
                      <option value="phd">博士</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="schoolType">学校类型</label>
                    <select id="schoolType">
                      <option value="secondTier">二本三本</option>
                      <option value="firstTier" selected>双非/QS200/USnews80</option>
                      <option value="elite">985211/QS50/USnews30</option>
                    </select>
                  </div>
                </div>
                <!-- 硕士本科背景选择 -->
                <div class="form-group bachelor-background" style="display: none;">
                  <label for="bachelorType">本科背景</label>
                  <select id="bachelorType">
                    <option value="secondTier">二本三本</option>
                    <option value="firstTier" selected>双非/QS200/USnews80</option>
                    <option value="elite">985211/QS50/USnews30</option>
                  </select>
                </div>
                <!-- 隐藏的教育系数字段，用于兼容现有计算逻辑 -->
                <input type="hidden" id="education" value="1.0">
              </div>

              <!-- 工作经历 -->
              <div class="form-row">
                <div class="form-group">
                  <label for="workYears">工作年限</label>
                  <select id="workYears">
                    <option value="0" selected>应届生</option>
                    <option value="1">1-3年</option>
                    <option value="3">3-5年</option>
                    <option value="5">5-8年</option>
                    <option value="8">8-10年</option>
                    <option value="10">10-12年</option>
                    <option value="12">12年以上</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="jobType">职业稳定度</label>
                  <select id="jobType">
                    <option value="government">政府/事业单位</option>
                    <option value="state">国企/大型企业</option>
                    <option value="foreign">外企/守法企业</option>
                    <option value="private" selected>私企/领件工厂</option>
                    <option value="dispatch">劳务派遣/OD</option>
                    <option value="freelance">自由职业</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="calculate-button-container">
              <button id="calculateJobWorth" class="calculate-btn">
                计算工作价值
              </button>
            </div>
          </div>

          <!-- 结果显示区域 -->
          <div id="jobWorthResult" class="job-worth-result" style="display: none;">
            <div class="result-header">
              <h3>📊 工作价值评估结果</h3>
            </div>
            <div class="result-content">
              <div class="result-score">
                <div class="score-value" id="jobWorthScore">0.00</div>
                <div class="score-label" id="jobWorthRating">请输入信息</div>
              </div>
              <div class="result-details">
                <div class="detail-item">
                  <span class="detail-label">标准化日薪：</span>
                  <span class="detail-value" id="dailySalaryDisplay">¥0</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">年工作天数：</span>
                  <span class="detail-value" id="workDaysDisplay">0天</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">每日总时间投入：</span>
                  <span class="detail-value" id="totalTimeDisplay">0小时</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">环境调整系数：</span>
                  <span class="detail-value" id="environmentFactorDisplay">1.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 致谢和参考来源 -->
        <div class="job-worth-credits">
          <div class="credits-content">
            <h4>🙏 致谢与参考</h4>
            <p>本工具基于开源项目 <strong>worth-calculator</strong> 的核心算法开发，感谢原作者的贡献！</p>
            <div class="credits-links">
              <a href="https://github.com/zippland/worth-calculator" target="_blank" rel="noopener noreferrer" class="credit-link">
                <span class="link-icon">🔗</span>
                <span class="link-text">查看原项目 worth-calculator</span>
                <span class="link-desc">GitHub - zippland/worth-calculator</span>
              </a>
            </div>
            <div class="credits-note">
              <p><strong>算法说明：</strong>本工具采用购买力平价(PPP)转换、经验调整系数、环境因素等多维度评估模型，为您提供科学的工作价值分析。</p>
              <p><strong>免责声明：</strong>计算结果仅供参考，实际工作选择应综合考虑个人情况、职业发展、市场环境等多种因素。</p>
            </div>
          </div>
        </div>
        `;const n={CN:4.19,US:1,JP:102.84,KR:870,SG:1.35,HK:6.07,TW:28.5,GB:.7,DE:.75,FR:.73,AU:1.47,CA:1.21,IN:21.99,TH:10.5,MY:1.7},o={CN:"¥",US:"$",JP:"¥",KR:"₩",SG:"S$",HK:"HK$",TW:"NT$",GB:"£",DE:"€",FR:"€",AU:"A$",CA:"C$",IN:"₹",TH:"฿",MY:"RM"},l=(u,m,h)=>{const w=52*u.workDaysPerWeek,x=u.annualLeave+u.publicHolidays+(u.paidSickLeave||0)*.6,S=Math.max(w-x,1),b=m[u.country]||4.19,C=u.salary*(4.19/b)/S,I=u.workDaysPerWeek>0?(u.workDaysPerWeek-Math.min(u.wfhDays,u.workDaysPerWeek))/u.workDaysPerWeek:0,$=u.hasShuttle?u.shuttleBus:1,E=u.commuteHours*I*$,F=u.hasCanteen?u.cafeteria:1,R=u.cityLevel*u.workEnvironment*u.teamwork*u.leadership*F,k=r(u.workYears,u.jobType),D=u.restTime||0,T=u.workHoursPerDay+E-.5*D,P=C*R/(35*T*u.education*k),L=d(P);return{score:P,rating:L,details:{dailySalary:C,workDaysPerYear:S,totalTimeInvestment:T,environmentFactor:R,experienceMultiplier:k,currencySymbol:h[u.country]||"¥"}}},r=(u,m)=>{let h=1;if(u===0)h={government:.8,state:.9,foreign:.95,private:1,startup:1.1}[m]||1;else{u===1?h=1.5:u<=3?h=2.2:u<=5?h=2.7:u<=8?h=3.2:u<=10?h=3.6:h=3.9;const w={government:.2,state:.4,foreign:.8,private:1,startup:1.2}[m]||1;h=1+(h-1)*w}return h},d=u=>u<.6?{text:"惨绝人寰",color:"#9d174d",class:"terrible"}:u<1?{text:"略惨",color:"#ef4444",class:"poor"}:u<1.5?{text:"一般",color:"#f97316",class:"average"}:u<2.5?{text:"还不错",color:"#3b82f6",class:"good"}:u<4?{text:"很爽",color:"#22c55e",class:"great"}:u<6?{text:"爽到爆炸",color:"#a855f7",class:"excellent"}:{text:"人生巅峰",color:"#facc15",class:"perfect"},c=(u,m,h,f)=>{const w=u.querySelector("#jobWorthResult"),x=u.querySelector("#jobWorthScore"),S=u.querySelector("#jobWorthRating");if(w&&x&&S){if(w.style.display="block",x.textContent=m.toFixed(2),typeof h=="object"?(S.textContent=h.text,S.style.color=h.color,S.className=`score-label ${h.class}`):(S.textContent=h,S.style.color="#6b7280",S.className="score-label"),f.dailySalary){const b=u.querySelector("#dailySalaryDisplay");b&&(b.textContent=`${f.currencySymbol}${f.dailySalary.toFixed(0)}`)}if(f.workDaysPerYear){const b=u.querySelector("#workDaysDisplay");b&&(b.textContent=`${f.workDaysPerYear}天`)}if(f.totalTimeInvestment){const b=u.querySelector("#totalTimeDisplay");b&&(b.textContent=`${f.totalTimeInvestment.toFixed(1)}小时`)}if(f.environmentFactor){const b=u.querySelector("#environmentFactorDisplay");b&&(b.textContent=f.environmentFactor.toFixed(2))}}},p=()=>{const u={salary:parseFloat(s.querySelector("#jobSalary")?.value)||0,country:s.querySelector("#jobCountry")?.value||"CN",workDaysPerWeek:parseFloat(s.querySelector("#workDaysPerWeek")?.value)||5,workHoursPerDay:parseFloat(s.querySelector("#workHoursPerDay")?.value)||8,commuteHours:parseFloat(s.querySelector("#commuteHours")?.value)||1,wfhDays:parseFloat(s.querySelector("#wfhDays")?.value)||0,annualLeave:parseFloat(s.querySelector("#annualLeave")?.value)||5,publicHolidays:parseFloat(s.querySelector("#publicHolidays")?.value)||11,cityLevel:parseFloat(s.querySelector("#cityLevel")?.value)||1,workEnvironment:parseFloat(s.querySelector("#workEnvironment")?.value)||1,teamwork:parseFloat(s.querySelector("#teamwork")?.value)||1,education:parseFloat(s.querySelector("#education")?.value)||1,workYears:parseFloat(s.querySelector("#workYears")?.value)||0,jobType:s.querySelector("#jobType")?.value||"private",hometown:s.querySelector("#hometown")?.value||"no",leadership:parseFloat(s.querySelector("#leadership")?.value)||1,shuttleBus:parseFloat(s.querySelector("#shuttleBus")?.value)||1,cafeteria:parseFloat(s.querySelector("#cafeteria")?.value)||1,hasShuttle:s.querySelector("#hasShuttle")?.checked||!1,hasCanteen:s.querySelector("#hasCanteen")?.checked||!1,restTime:parseFloat(s.querySelector("#restTime")?.value)||0,paidSickLeave:parseFloat(s.querySelector("#paidSickLeave")?.value)||0};if(!u.salary){c(s,0,"请输入年薪",{});return}const m=l(u,n,o);c(s,m.score,m.rating,m.details)},v=s.querySelector("#calculateJobWorth");v&&v.addEventListener("click",p),s.querySelectorAll("input, select").forEach(u=>{u.addEventListener("input",p),u.addEventListener("change",p)});break;default:console.error("未知的工具类型:",e)}this.currentTool=e}backToMainPage(){const e=document.getElementById("mainPage"),t=document.getElementById("toolContainer");e.classList.remove("hidden"),t.classList.add("hidden"),this.currentTool=null}loadTradingCalculator(e){this.tools.trading?this.tools.trading.renderTo(e):this.tools.trading=new A(e)}loadInterestCalculator(e){e.innerHTML=`
      <div class="interest-calculator-standalone">
        <div class="calculator-section">
          <h2>💰 智能利息计算器</h2>
          <div class="calculator-form">
            <div class="input-group">
              <label>本金金额 (万元)</label>
              <input type="number" id="principalAmount" value="100" min="0.01" step="0.01">
            </div>
            <div class="input-group">
              <label>年利率 (%)</label>
              <input type="number" id="annualRate" value="2.65" min="0" max="100" step="0.01">
              <div class="input-help">银行存款利率，默认2.65%</div>
            </div>
            <div class="input-group">
              <label>计算期限 (年)</label>
              <input type="number" id="timePeriod" value="1" min="0.1" max="50" step="0.1">
            </div>
            <div class="calculation-type">
              <label>
                <input type="radio" name="calcType" value="simple" checked>
                <span>单利计算</span>
              </label>
              <label>
                <input type="radio" name="calcType" value="compound">
                <span>复利计算</span>
              </label>
            </div>
          </div>

          <div class="results-section">
            <h3>计算结果</h3>
            <div class="results-grid">
              <div class="result-item">
                <span class="result-label">每日利息：</span>
                <span class="result-value" id="dailyInterestResult">-</span>
              </div>
              <div class="result-item">
                <span class="result-label">每月利息：</span>
                <span class="result-value" id="monthlyInterestResult">-</span>
              </div>
              <div class="result-item">
                <span class="result-label">每年利息：</span>
                <span class="result-value" id="yearlyInterestResult">-</span>
              </div>
              <div class="result-item highlight">
                <span class="result-label">期末总额：</span>
                <span class="result-value" id="totalAmountResult">-</span>
              </div>
              <div class="result-item highlight">
                <span class="result-label">总利息收入：</span>
                <span class="result-value" id="totalInterestResult">-</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,setTimeout(()=>{this.bindInterestCalculatorEvents()},100)}bindInterestCalculatorEvents(){["principalAmount","annualRate","timePeriod"].forEach(i=>{const a=document.getElementById(i);a&&(a.addEventListener("input",()=>this.calculateInterestStandalone()),a.addEventListener("change",()=>this.calculateInterestStandalone()))});const t=document.querySelector(".interest-calculator-standalone");t&&t.querySelectorAll('input[name="calcType"]').forEach(a=>{a.addEventListener("change",()=>{this.calculateInterestStandalone()})}),this.calculateInterestStandalone()}calculateInterestStandalone(){const e=parseFloat(document.getElementById("principalAmount").value)||0,t=parseFloat(document.getElementById("annualRate").value)||0,i=parseFloat(document.getElementById("timePeriod").value)||0,a=document.querySelector('input[name="calcType"]:checked').value;if(e<=0||t<0||i<=0){this.clearInterestResults();return}const s=t/100;let n,o,l,r,d;if(a==="simple")o=e*s*i,n=e+o,d=e*s,r=d/12,l=d/365;else{n=e*Math.pow(1+s,i),o=n-e;const c=Math.pow(1+s,1/365)-1,p=Math.pow(1+s,1/12)-1;l=e*c,r=e*p,d=e*s}document.getElementById("dailyInterestResult").textContent=`${l.toFixed(4)}万元 (${(l*1e4).toFixed(0)}元)`,document.getElementById("monthlyInterestResult").textContent=`${r.toFixed(3)}万元 (${(r*1e4).toFixed(0)}元)`,document.getElementById("yearlyInterestResult").textContent=`${d.toFixed(2)}万元 (${(d*1e4).toFixed(0)}元)`,document.getElementById("totalAmountResult").textContent=`${n.toFixed(2)}万元 (${(n*1e4).toFixed(0)}元)`,document.getElementById("totalInterestResult").textContent=`${o.toFixed(2)}万元 (${(o*1e4).toFixed(0)}元)`}clearInterestResults(){["dailyInterestResult","monthlyInterestResult","yearlyInterestResult","totalAmountResult","totalInterestResult"].forEach(e=>{document.getElementById(e).textContent="-"})}loadSalaryCalculator(e){e.innerHTML=`
      <div class="salary-calculator">
        <div class="container">
          <!-- 四象限布局 -->
          <div class="four-quadrant-layout">
            <!-- 第1象限：基础信息设置 -->
            <div class="quadrant quadrant-1">
              <h2 class="section-title">👤 基础信息</h2>

              <div class="form-group">
                <h3>年龄规划</h3>
                <div class="input-group">
                  <label>当前年龄</label>
                  <input type="number" id="currentAge" value="25" min="18" max="65">
                  <div class="input-help">岁</div>
                </div>
                <div class="input-group">
                  <label>目标退休年龄</label>
                  <input type="number" id="retireAge" value="60" min="30" max="80">
                  <div class="input-help">岁</div>
                </div>
                <div class="retirement-age-notice">
                  <p>📋 截至2024年中国大陆法定退休年龄：</p>
                  <p>👨 男性：60岁 | 👩 女性：50-55岁（工人50岁，干部55岁）</p>
                  <p>💡 建议根据个人情况和政策变化调整目标退休年龄</p>
                </div>
                <div class="input-group">
                  <label>工作年限</label>
                  <input type="number" id="workingYears" value="35" min="1" max="50" step="1">
                  <div class="input-help">年（默认为退休年龄-当前年龄，可自定义）</div>
                  <button type="button" id="resetWorkingYears" class="reset-btn" title="重置为自动计算">🔄</button>
                </div>
              </div>

              <div class="form-group">
                <h3>财富目标</h3>
                <div class="input-group">
                  <label>财富自由目标金额 (万元)</label>
                  <input type="number" id="targetAmount" value="500" min="50" max="10000" step="10">
                  <div class="input-help">实现财富自由所需的总金额</div>
                </div>
              </div>

              <div class="form-group">
                <h3>当前收入</h3>
                <div class="input-group">
                  <label>月平均可存工资 (元)</label>
                  <input type="number" id="monthlySavings" value="8000" min="100" max="100000" step="100">
                  <div class="input-help">已扣除生活成本，可用于储蓄投资的金额</div>
                </div>
                <div class="input-group">
                  <label>年终奖等额外收入 (元)</label>
                  <input type="number" id="yearEndBonus" value="50000" min="0" max="1000000" step="1000">
                  <div class="input-help">年终奖、项目奖金等大额收入</div>
                </div>
              </div>
            </div>

            <!-- 第2象限：涨薪规划 -->
            <div class="quadrant quadrant-2">
              <h2 class="section-title">💰 涨薪规划</h2>

              <div class="form-group">
                <h3>职业发展规划</h3>
                <div id="salaryIncrements">
                  <div class="increment-item" data-index="0">
                    <div class="increment-header">
                      <span class="increment-title">第1次涨薪</span>
                      <button type="button" class="remove-increment" data-index="0">×</button>
                    </div>
                    <div class="increment-inputs">
                      <div class="input-group">
                        <label>预计时间 (年后)</label>
                        <input type="number" class="increment-years" value="2" min="0.5" max="40" step="0.5">
                      </div>
                      <div class="input-group">
                        <label>月储蓄增长 (%)</label>
                        <input type="number" class="increment-percentage" value="20" min="-50" max="200" step="1">
                        <div class="input-help">涨薪后月储蓄能力的增长幅度</div>
                      </div>

                    </div>
                  </div>
                </div>
                <button type="button" id="addIncrement" class="add-increment-btn">+ 添加涨薪阶段</button>
              </div>
            </div>

            <!-- 第3象限：投资设置 -->
            <div class="quadrant quadrant-3">
              <h2 class="section-title">📈 投资策略</h2>

              <div class="form-group">
                <h3>投资配置</h3>
                <div class="input-group">
                  <label class="checkbox-label">
                    <input type="checkbox" id="hasInvestment" checked>
                    <span>启用投资收益</span>
                  </label>
                  <div class="input-help">是否将储蓄进行投资获取额外收益</div>
                </div>

                <div id="investmentSettings" class="investment-settings">
                  <div class="input-group">
                    <label>年化投资收益率 (%)</label>
                    <input type="number" id="investmentReturn" value="6.5" min="0" max="30" step="0.1">
                    <div class="input-help">预期年化收益率，建议保守估计</div>
                  </div>
                  <div class="input-group">
                    <label>投资比例 (%)</label>
                    <input type="number" id="investmentRatio" value="80" min="0" max="100" step="5">
                    <div class="input-help">储蓄中用于投资的比例，其余为活期存款</div>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <h3>风险提示</h3>
                <div class="risk-notice">
                  <p>⚠️ 投资有风险，收益率仅为预估</p>
                  <p>💡 建议：保守估计收益率，分散投资风险</p>
                  <p>📊 参考：沪深300指数年化收益约8-12%</p>
                </div>
              </div>
            </div>

            <!-- 第4象限：计算结果 -->
            <div class="quadrant quadrant-4">
              <h2 class="section-title">🎯 计算结果</h2>

              <div class="calculate-section">
                <button id="salaryCalculateBtn" class="calculate-btn">
                  开始计算
                </button>
              </div>

              <div id="salaryResultArea" class="result-area">
                <div class="result-placeholder">
                  <p>请设置参数并点击"开始计算"</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 下方新增卡片区域 -->
          <div class="additional-cards-layout">
            <!-- 财富增长可视化图表 -->
            <div class="card wealth-chart-card">
              <div class="card-header">
                <h2 class="section-title">📈 财富增长可视化图表</h2>
                <div class="chart-controls">
                  <button id="chartTypeToggle" class="chart-toggle-btn">
                    <span class="chart-type-text">年度视图</span>
                    <span class="toggle-icon">📊</span>
                  </button>
                </div>
              </div>
              <div id="salaryWealthChart" class="chart-container">
                <div class="chart-placeholder">
                  <div class="placeholder-icon">📊</div>
                  <p>完成计算后将显示财富增长趋势图</p>
                  <div class="placeholder-features">
                    <span class="feature-tag">年度增长</span>
                    <span class="feature-tag">累计储蓄</span>
                    <span class="feature-tag">投资收益</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 优化建议 -->
            <div class="card optimization-card">
              <div class="card-header">
                <h2 class="section-title">💡 优化建议</h2>
                <div class="suggestion-controls">
                  <button id="refreshSuggestions" class="refresh-btn" title="刷新建议">
                    🔄
                  </button>
                </div>
              </div>
              <div id="salaryOptimizationArea" class="optimization-area">
                <div class="optimization-placeholder">
                  <div class="placeholder-icon">💡</div>
                  <p>完成计算后将显示个性化优化建议</p>
                  <div class="placeholder-features">
                    <span class="feature-tag">收入优化</span>
                    <span class="feature-tag">投资策略</span>
                    <span class="feature-tag">时间规划</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,setTimeout(()=>{this.bindSalaryCalculatorEvents()},100)}bindSalaryCalculatorEvents(){["currentAge","retireAge"].forEach(c=>{const p=document.getElementById(c);p&&(p.addEventListener("input",()=>this.updateWorkingYears()),p.addEventListener("change",()=>this.updateWorkingYears()))});const t=document.getElementById("hasInvestment");t&&t.addEventListener("change",()=>{const c=document.getElementById("investmentSettings");c&&(c.style.display=t.checked?"block":"none")});const i=document.getElementById("addIncrement");i&&i.addEventListener("click",()=>this.addSalaryIncrement());const a=document.getElementById("salaryCalculateBtn");a&&a.addEventListener("click",()=>this.calculateSalaryWealth());const s=document.getElementById("chartTypeToggle");s&&s.addEventListener("click",()=>this.toggleChartType());const n=document.getElementById("refreshSuggestions");n&&n.addEventListener("click",()=>this.refreshSalaryOptimizationSuggestions()),this.isWorkingYearsManuallySet=!1,this.currentChartType="yearly";const o=document.getElementById("currentAge"),l=document.getElementById("retireAge"),r=document.getElementById("workingYears"),d=document.getElementById("resetWorkingYears");o&&o.addEventListener("input",()=>this.updateWorkingYears()),l&&l.addEventListener("input",()=>this.updateWorkingYears()),r&&r.addEventListener("input",()=>{this.isWorkingYearsManuallySet=!0}),d&&d.addEventListener("click",()=>{this.isWorkingYearsManuallySet=!1,this.updateWorkingYears()}),this.updateWorkingYears(),this.bindIncrementEvents()}updateWorkingYears(){if(!this.isWorkingYearsManuallySet){const e=parseInt(document.getElementById("currentAge").value)||25,t=parseInt(document.getElementById("retireAge").value)||60,i=Math.max(0,t-e),a=document.getElementById("workingYears");a&&(a.value=i)}}addSalaryIncrement(){const e=document.getElementById("salaryIncrements"),t=e.children.length,i=`
      <div class="increment-item" data-index="${t}">
        <div class="increment-header">
          <span class="increment-title">第${t+1}次涨薪</span>
          <button type="button" class="remove-increment" data-index="${t}">×</button>
        </div>
        <div class="increment-inputs">
          <div class="input-group">
            <label>预计时间 (年后)</label>
            <input type="number" class="increment-years" value="${t*2+2}" min="0.5" max="40" step="0.5">
          </div>
          <div class="input-group">
            <label>月储蓄增长 (%)</label>
            <input type="number" class="increment-percentage" value="15" min="-50" max="200" step="1">
            <div class="input-help">涨薪后月储蓄能力的增长幅度</div>
          </div>

        </div>
      </div>
    `;e.insertAdjacentHTML("beforeend",i),this.bindIncrementEvents()}bindIncrementEvents(){document.querySelectorAll(".remove-increment").forEach(e=>{e.addEventListener("click",t=>{const i=t.target.dataset.index,a=document.querySelector(`.increment-item[data-index="${i}"]`);a&&document.querySelectorAll(".increment-item").length>1&&(a.remove(),this.updateIncrementTitles())})})}updateIncrementTitles(){document.querySelectorAll(".increment-item").forEach((e,t)=>{const i=e.querySelector(".increment-title");i&&(i.textContent=`第${t+1}次涨薪`),e.dataset.index=t;const a=e.querySelector(".remove-increment");a&&(a.dataset.index=t)})}calculateSalaryWealth(){const e=this.getSalaryCalculatorParams();if(!e){alert("请检查输入参数");return}const t=document.getElementById("salaryResultArea");t.innerHTML=`
      <div class="loading">
        <div class="loading-spinner"></div>
        <p>正在计算中...</p>
      </div>
    `,setTimeout(()=>{try{const i=this.simulateSalaryWealth(e);this.displaySalaryResult(i,e),this.lastSalaryResult=i,this.lastSalaryParams=e,this.generateChartAndSuggestions(i,e)}catch(i){console.error("计算错误:",i),t.innerHTML=`
          <div class="error-message">
            <p>计算过程中出现错误，请检查输入参数</p>
          </div>
        `}},1e3)}getSalaryCalculatorParams(){try{const e=parseInt(document.getElementById("currentAge").value),t=parseInt(document.getElementById("retireAge").value),i=parseInt(document.getElementById("workingYears").value),a=parseFloat(document.getElementById("targetAmount").value)*1e4,s=parseFloat(document.getElementById("monthlySavings").value),n=parseFloat(document.getElementById("yearEndBonus").value),o=document.getElementById("hasInvestment").checked,l=parseFloat(document.getElementById("investmentReturn").value)/100,r=parseFloat(document.getElementById("investmentRatio").value)/100,d=[];return document.querySelectorAll(".increment-item").forEach(c=>{const p=parseFloat(c.querySelector(".increment-years").value),v=parseFloat(c.querySelector(".increment-percentage").value)/100;d.push({yearsFromNow:p,incrementPercentage:v})}),d.sort((c,p)=>c.yearsFromNow-p.yearsFromNow),{currentAge:e,retireAge:t,workingYears:i,targetAmount:a,monthlySavings:s,yearEndBonus:n,hasInvestment:o,investmentReturn:l,investmentRatio:r,salaryIncrements:d}}catch{return null}}simulateSalaryWealth(e){const t=e.workingYears;let i=0,a=e.monthlySavings,s=e.yearEndBonus;const n=[];let o=0;for(let l=1;l<=t;l++){for(;o<e.salaryIncrements.length&&e.salaryIncrements[o].yearsFromNow<=l;){const p=e.salaryIncrements[o];a*=1+p.incrementPercentage,s*=1+p.incrementPercentage,o++}const r=a*12+s;if(e.hasInvestment){const p=r*e.investmentRatio,v=r*(1-e.investmentRatio);i*=1+e.investmentReturn*e.investmentRatio+.02*(1-e.investmentRatio),i+=p*(1+e.investmentReturn*.5),i+=v*1.02}else i=i*1.02+r*1.01;const d=n.reduce((p,v)=>p+v.annualSavings,0)+r,c=i-d;if(n.push({year:l,age:e.currentAge+l,annualSavings:r,totalWealth:i,totalSavings:d,totalInvestmentReturn:Math.max(0,c),monthlySavings:a,yearEndBonus:s}),i>=e.targetAmount)return{success:!0,yearsToTarget:l,ageAtTarget:e.currentAge+l,finalWealth:i,yearlyData:n,totalSavings:n.reduce((p,v)=>p+v.annualSavings,0),investmentGain:i-n.reduce((p,v)=>p+v.annualSavings,0)}}return{success:!1,yearsToTarget:t,ageAtTarget:e.retireAge,finalWealth:i,yearlyData:n,shortfall:e.targetAmount-i,totalSavings:n.reduce((l,r)=>l+r.annualSavings,0),investmentGain:i-n.reduce((l,r)=>l+r.annualSavings,0)}}displaySalaryResult(e,t){const i=document.getElementById("salaryResultArea");e.success?i.innerHTML=`
        <div class="result-success">
          <div class="result-header">
            <h3>🎉 恭喜！可以实现财富自由</h3>
          </div>

          <div class="result-summary">
            <div class="result-card primary">
              <div class="result-label">达到目标时间</div>
              <div class="result-value primary">${e.yearsToTarget}年</div>
              <div class="result-detail">在${e.ageAtTarget}岁时达到${(t.targetAmount/1e4).toFixed(0)}万元目标</div>
            </div>

            <div class="result-grid">
              <div class="result-card">
                <div class="result-label">最终财富</div>
                <div class="result-value">${(e.finalWealth/1e4).toFixed(1)}万元</div>
              </div>
              <div class="result-card">
                <div class="result-label">累计储蓄</div>
                <div class="result-value">${(e.totalSavings/1e4).toFixed(1)}万元</div>
              </div>
              <div class="result-card">
                <div class="result-label">投资收益</div>
                <div class="result-value">${(e.investmentGain/1e4).toFixed(1)}万元</div>
              </div>
              <div class="result-card">
                <div class="result-label">收益率</div>
                <div class="result-value">${(e.investmentGain/e.totalSavings*100).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      `:i.innerHTML=`
        <div class="result-failure">
          <div class="result-header">
            <h3>😔 当前计划无法达到目标</h3>
          </div>

          <div class="result-summary">
            <div class="result-card warning">
              <div class="result-label">退休时财富</div>
              <div class="result-value">${(e.finalWealth/1e4).toFixed(1)}万元</div>
              <div class="result-detail">距离目标还差${(e.shortfall/1e4).toFixed(1)}万元</div>
            </div>

            <div class="suggestions">
              <h4>💡 优化建议</h4>
              <ul>
                <li>提高月储蓄金额${Math.ceil(e.shortfall/e.yearsToTarget/12)}元</li>
                <li>或延长工作时间${Math.ceil(e.shortfall/(e.totalSavings/e.yearsToTarget))}年</li>
                <li>或提高投资收益率${(e.shortfall/e.totalSavings*100).toFixed(1)}%</li>
              </ul>
            </div>
          </div>
        </div>
      `}generateChartAndSuggestions(e,t){try{console.log("开始生成图表和建议..."),setTimeout(()=>{try{this.generateSalaryWealthChart(e),this.generateSalaryOptimizationSuggestions(e,t)}catch(i){console.error("生成图表和建议时出错:",i),this.showSimpleChart(e),this.showSimpleSuggestions(e,t)}},200)}catch(i){console.error("初始化图表和建议时出错:",i)}}generateSalaryWealthChart(e){const t=document.getElementById("salaryWealthChart");if(!t||!e.yearlyData)return;const i=this.currentChartType==="monthly",a=i?this.convertToMonthlyData(e.yearlyData):e.yearlyData,s=this.lastSalaryParams,n=this.analyzeSalaryStages(s,a);t.innerHTML=`
      <div class="chart-content">
        <div class="chart-header">
          <h3>${i?"月度":"年度"}财富增长趋势</h3>
          <div class="chart-legend">
            <span class="legend-item">
              <span class="legend-color" style="background: #3b82f6;"></span>
              累计储蓄
            </span>
            <span class="legend-item">
              <span class="legend-color" style="background: #10b981;"></span>
              投资收益
            </span>
            <span class="legend-item">
              <span class="legend-color" style="background: #f59e0b;"></span>
              总财富
            </span>
          </div>
        </div>
        <div class="chart-body">
          ${this.renderStageBasedChart(a,n,i)}
        </div>
        <div class="chart-summary">
          <div class="summary-item">
            <span class="summary-label">最终财富：</span>
            <span class="summary-value">${(e.finalWealth/1e4).toFixed(1)}万元</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">投资收益率：</span>
            <span class="summary-value">${this.calculateInvestmentReturnRate(e,s).toFixed(1)}%</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">涨薪阶段：</span>
            <span class="summary-value">${n.length}个</span>
          </div>
        </div>
      </div>
    `}showSimpleChart(e){const t=document.getElementById("salaryWealthChart");t&&(t.innerHTML=`
      <div class="chart-content">
        <div class="chart-header">
          <h3>财富增长趋势（简化版）</h3>
        </div>
        <div class="simple-chart">
          <div class="chart-info">
            <p>📊 基于您的设置，财富将在${e.yearsToTarget}年内达到目标</p>
            <p>💰 最终财富：${(e.finalWealth/1e4).toFixed(1)}万元</p>
            <p>📈 年均增长：${(e.finalWealth/e.yearsToTarget/1e4).toFixed(1)}万元/年</p>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.min(100,e.finalWealth/5e6*100)}%"></div>
          </div>
          <p class="progress-text">目标完成度：${Math.min(100,e.finalWealth/5e6*100).toFixed(1)}%</p>
        </div>
      </div>
    `)}showSimpleSuggestions(e,t){const i=document.getElementById("salaryOptimizationArea");if(!i)return;const a=[];t.monthlySavings<1e4&&a.push({icon:"💰",title:"提升储蓄能力",description:"当前月储蓄较低，建议通过技能提升增加收入",priority:"high"}),t.salaryIncrements.length<2&&a.push({icon:"🚀",title:"制定涨薪计划",description:"建议设置更多阶段性涨薪目标",priority:"medium"}),t.investmentReturn<.08&&a.push({icon:"📈",title:"优化投资策略",description:"可考虑配置更多成长性资产",priority:"medium"}),i.innerHTML=`
      <div class="optimization-content">
        <div class="optimization-header">
          <h3>🎯 优化建议</h3>
          <p>基于您的财务状况的建议</p>
        </div>
        <div class="simple-suggestions">
          ${a.map(s=>`
            <div class="suggestion-item ${s.priority}">
              <span class="suggestion-icon">${s.icon}</span>
              <div class="suggestion-text">
                <h4>${s.title}</h4>
                <p>${s.description}</p>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `}analyzeSalaryStages(e,t){const i=[];let a={startYear:1,endYear:t.length,salaryLevel:e.monthlySavings,description:"初始阶段"};return i.push({...a}),e.salaryIncrements&&e.salaryIncrements.length>0&&e.salaryIncrements.forEach((s,n)=>{const o=s.yearsFromNow,l=n<e.salaryIncrements.length-1?e.salaryIncrements[n+1].yearsFromNow:t.length;i.push({startYear:o,endYear:l,salaryLevel:a.salaryLevel*(1+s.incrementPercentage),description:`第${n+1}次涨薪阶段`,incrementPercentage:s.incrementPercentage}),a.salaryLevel*=1+s.incrementPercentage}),i}convertToMonthlyData(e){const t=[];return e.forEach(i=>{for(let a=1;a<=12;a++){const s=i.totalWealth*(a/12),n=i.totalSavings*(a/12),o=i.totalInvestmentReturn*(a/12);t.push({period:`${i.year}年${a}月`,totalWealth:s,totalSavings:n,totalInvestmentReturn:o})}}),t.slice(0,60)}renderStageBasedChart(e,t,i){const a=Math.max(...e.map(p=>p.totalWealth)),s=300,n=Math.max(800,e.length*40),o=this.generateSmoothPath(e,"totalSavings",a,s,n),l=this.generateSmoothPath(e,"totalInvestmentReturn",a,s,n),r=this.generateSmoothPath(e,"totalWealth",a,s,n),d=t.map(p=>{const v=(p.startYear-1)/(e.length-1)*n;return`
        <line x1="${v}" y1="0" x2="${v}" y2="${s}"
              stroke="#e5e7eb" stroke-width="2" stroke-dasharray="5,5" />
        <text x="${v+5}" y="20" fill="#6b7280" font-size="12">
          ${p.description}
        </text>
      `}).join(""),c=`chart-${Date.now()}`;return`
      <div class="stage-chart-container" style="position: relative;">
        <!-- 自定义Tooltip -->
        <div id="chart-tooltip-${c}" class="chart-tooltip" style="
          position: absolute;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s;
          z-index: 1000;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          <div class="tooltip-content"></div>
        </div>

        <svg id="wealth-chart-${c}" width="${n}" height="${s+50}" viewBox="0 0 ${n} ${s+50}" style="cursor: crosshair;">
          <!-- 背景网格 -->
          ${this.generateGridLines(n,s)}

          <!-- 阶段标记 -->
          ${d}

          <!-- 储蓄曲线 -->
          <path d="${o}" fill="none" stroke="#3b82f6" stroke-width="3" opacity="0.8"/>

          <!-- 投资收益曲线 -->
          <path d="${l}" fill="none" stroke="#10b981" stroke-width="3" opacity="0.8"/>

          <!-- 总财富曲线 -->
          <path d="${r}" fill="none" stroke="#f59e0b" stroke-width="4"/>

          <!-- 数据点 -->
          ${this.generateDataPoints(e,a,s,n)}

          <!-- X轴标签 -->
          ${this.generateXAxisLabels(e,s,n,i)}

          <!-- 透明的交互层 -->
          <rect width="${n}" height="${s}" fill="transparent"
                onmousemove="window.financialApp.handleChartMouseMove(event, '${c}', ${JSON.stringify(e).replace(/"/g,"&quot;")}, ${a}, ${s}, ${n}, ${i})"
                onmouseleave="window.financialApp.hideChartTooltip('${c}')"/>
        </svg>

        <!-- 阶段信息面板 -->
        <div class="stages-info">
          ${t.map(p=>`
            <div class="stage-info">
              <span class="stage-name">${p.description}</span>
              <span class="stage-period">第${p.startYear}-${p.endYear}年</span>
              ${p.incrementPercentage?`<span class="stage-increment">+${(p.incrementPercentage*100).toFixed(0)}%</span>`:""}
            </div>
          `).join("")}
        </div>

        <script>
          // 初始化图表交互功能
          setTimeout(() => {
            if (window.financialApp) {
              window.financialApp.initChartInteraction('${c}');
            }
          }, 100);
        <\/script>
      </div>
    `}generateSalaryOptimizationSuggestions(e,t){const i=document.getElementById("salaryOptimizationArea");if(!i)return;const a=this.analyzeSalaryOptimizations(e,t);i.innerHTML=`
      <div class="optimization-content">
        <div class="optimization-header">
          <h3>🎯 个性化优化建议</h3>
          <p>基于您的财务状况，以下是提升财富积累效率的建议</p>
        </div>
        <div class="suggestions-grid">
          ${a.map(s=>`
            <div class="suggestion-card ${s.priority}">
              <div class="suggestion-icon">${s.icon}</div>
              <div class="suggestion-content">
                <h4>${s.title}</h4>
                <p>${s.description}</p>
                <div class="suggestion-impact">
                  <span class="impact-label">预期效果：</span>
                  <span class="impact-value">${s.impact}</span>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
        <div class="optimization-footer">
          <p class="disclaimer">💡 建议仅供参考，请根据个人实际情况谨慎决策</p>
        </div>
      </div>
    `}analyzeSalaryOptimizations(e,t){const i=[];return t.monthlySavings<1e4&&i.push({icon:"💰",title:"提升储蓄能力",description:`当前月储蓄${t.monthlySavings}元，建议通过技能提升、副业等方式增加收入`,impact:`每增加1000元月储蓄，可提前约${Math.round(1e3*12*t.workingYears/t.targetAmount*12)}个月达到目标`,priority:"high"}),t.hasInvestment&&t.investmentReturn<.08&&i.push({icon:"📈",title:"优化投资策略",description:`当前投资收益率${(t.investmentReturn*100).toFixed(1)}%，可考虑配置更多成长性资产`,impact:`收益率提升1%，可提前约${Math.round(e.yearsToTarget*.1)}年达到目标`,priority:"medium"}),t.workingYears>30&&i.push({icon:"⏰",title:"考虑提前退休规划",description:"工作年限较长，可考虑更积极的投资策略或增加被动收入来源",impact:"合理规划可提前5-10年实现财务自由",priority:"medium"}),t.salaryIncrements.length===0&&i.push({icon:"🚀",title:"制定涨薪计划",description:"建议设置阶段性涨薪目标，通过职业发展提升收入水平",impact:"每2-3年涨薪20%，可显著缩短财富积累时间",priority:"high"}),i.slice(0,4)}generateSmoothPath(e,t,i,a,s){if(e.length===0)return"";const n=e.map((l,r)=>{const d=r/(e.length-1)*s,c=a-(l[t]||0)/i*a;return{x:d,y:c}});if(n.length===1)return`M ${n[0].x} ${n[0].y}`;let o=`M ${n[0].x} ${n[0].y}`;for(let l=1;l<n.length;l++){const r=n[l-1],d=n[l];if(l===1){const c=r.x+(d.x-r.x)*.5,p=r.y;o+=` Q ${c} ${p} ${d.x} ${d.y}`}else{const c=n[l-2],p=r.x+(d.x-c.x)*.15,v=r.y,y=d.x-(n[Math.min(l+1,n.length-1)].x-r.x)*.15,u=d.y;o+=` C ${p} ${v} ${y} ${u} ${d.x} ${d.y}`}}return o}generateGridLines(e,t){const i=[];for(let s=0;s<=5;s++){const n=s/5*t;i.push(`
        <line x1="0" y1="${n}" x2="${e}" y2="${n}"
              stroke="#f3f4f6" stroke-width="1" />
      `)}const a=Math.min(10,Math.floor(e/80));for(let s=0;s<=a;s++){const n=s/a*e;i.push(`
        <line x1="${n}" y1="0" x2="${n}" y2="${t}"
              stroke="#f3f4f6" stroke-width="1" />
      `)}return i.join("")}generateDataPoints(e,t,i,a){return e.map((s,n)=>{const o=n/(e.length-1)*a,l=i-s.totalWealth/t*i;return`
        <circle cx="${o}" cy="${l}" r="4" fill="#f59e0b" stroke="white" stroke-width="2">
          <title>第${s.year}年: ${(s.totalWealth/1e4).toFixed(1)}万元</title>
        </circle>
      `}).join("")}generateXAxisLabels(e,t,i,a){const s=Math.min(8,e.length),n=[];for(let o=0;o<s;o++){const l=Math.floor(o/(s-1)*(e.length-1)),r=e[l],d=l/(e.length-1)*i;n.push(`
        <text x="${d}" y="${t+20}" text-anchor="middle" fill="#6b7280" font-size="12">
          ${a?r.period?r.period.slice(-3):`${r.year}年`:`${r.year}年`}
        </text>
      `)}return n.join("")}toggleChartType(){const t=document.getElementById("chartTypeToggle").querySelector(".chart-type-text");t.textContent==="年度视图"?(t.textContent="月度视图",this.currentChartType="monthly"):(t.textContent="年度视图",this.currentChartType="yearly"),this.lastSalaryResult&&this.generateSalaryWealthChart(this.lastSalaryResult)}refreshSalaryOptimizationSuggestions(){const e=this.lastSalaryResult,t=this.lastSalaryParams;e&&t&&this.generateSalaryOptimizationSuggestions(e,t)}addSalaryIncrement(){const e=document.getElementById("salaryIncrements"),t=e.children.length,i=document.createElement("div");i.className="increment-item",i.setAttribute("data-index",t),i.innerHTML=`
      <div class="increment-header">
        <span class="increment-title">第${t+1}次涨薪</span>
        <button type="button" class="remove-increment" data-index="${t}" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
      <div class="increment-inputs">
        <div class="input-group">
          <label>预计时间 (年后)</label>
          <input type="number" class="increment-years" value="${t*2+4}" min="0.5" max="40" step="0.5">
        </div>
        <div class="input-group">
          <label>月储蓄增长 (%)</label>
          <input type="number" class="increment-percentage" value="20" min="-50" max="200" step="1">
          <div class="input-help">涨薪后月储蓄能力的增长幅度</div>
        </div>
      </div>
    `,e.appendChild(i)}calculateInvestmentReturnRate(e,t){if(!t.hasInvestment||!e.totalInvestmentReturn||!e.totalSavings)return 0;const i=e.yearsToTarget,a=e.totalSavings*(t.investmentRatio/100),s=e.totalInvestmentReturn;if(a<=0||i<=0)return 0;const n=Math.pow(s/a,1/i)-1;return Math.max(0,n*100)}}class A{constructor(e=null){this.currentChart=null,this.userProfile=new B,this.container=e,e&&this.renderTo(e)}renderTo(e){this.container=e,e.innerHTML=this.createHTML(),this.bindEvents()}createHTML(){return`
      <div class="container">
        <!-- 主要内容区域 - 4象限布局 -->
        <div class="four-quadrant-layout">
          <!-- 第1象限：参数设置 -->
          <div class="quadrant quadrant-1">
            <h2 class="section-title">📊 交易参数设置</h2>

            <!-- 基础参数 -->
            <div class="form-group">
              <h3>基础参数</h3>
              <div class="input-group">
                <label>初始本金 (万元)</label>
                <input type="number" id="initialCapital" value="10" min="1" max="10000">
              </div>
              <div class="input-group">
                <label>目标金额 (万元)</label>
                <input type="number" id="targetAmount" value="100" min="1" max="100000">
              </div>
              <div class="input-group">
                <label>平均每日交易次数</label>
                <input type="number" id="dailyTrades" value="2" min="0.1" max="50" step="0.1">
                <div class="input-help">买入卖出算两次</div>
              </div>
              <div class="input-group">
                <label>平均交易仓位 (%)</label>
                <input type="number" id="positionSize" value="30" min="1" max="100">
                <div class="input-help">每次交易投入的资金比例</div>
              </div>
            </div>

            <!-- 交易策略参数 -->
            <div class="form-group">
              <h3>交易策略参数</h3>
              <div class="input-group">
                <label>胜率 (%)</label>
                <input type="number" id="winRate" value="60" min="0" max="100">
                <div class="input-help">盈利交易占总交易的比例</div>
              </div>
              <div class="input-group">
                <label>盈利时平均收益率 (%)</label>
                <input type="number" id="avgProfitRate" value="5" min="0" max="100" step="0.1">
              </div>
              <div class="input-group">
                <label>亏损时平均损失率 (%)</label>
                <input type="number" id="avgLossRate" value="3" min="0" max="100" step="0.1">
              </div>
            </div>

            <!-- 计算按钮 -->
            <button id="calculateBtn" class="calculate-btn">
              开始计算
            </button>

            <!-- 利息计算小工具 -->
            <div class="interest-calculator-section">
              <h3>💰 利息计算器</h3>
              <div class="interest-form">
                <div class="input-group">
                  <label>目标金额 (万元)</label>
                  <input type="number" id="interestTargetAmount" value="100" min="0.01" step="0.01">
                </div>
                <div class="input-group">
                  <label>年利率 (%)</label>
                  <input type="number" id="interestRate" value="2.65" min="0" max="100" step="0.01">
                  <div class="input-help">银行存款利率，默认2.65%</div>
                </div>
                <div class="interest-results">
                  <div class="interest-result-item">
                    <span class="interest-label">每日利息：</span>
                    <span class="interest-value" id="dailyInterest">-</span>
                  </div>
                  <div class="interest-result-item">
                    <span class="interest-label">每月利息：</span>
                    <span class="interest-value" id="monthlyInterest">-</span>
                  </div>
                  <div class="interest-result-item">
                    <span class="interest-label">每年利息：</span>
                    <span class="interest-value" id="yearlyInterest">-</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 第2象限：计算结果 + 可视化图表 -->
          <div class="quadrant quadrant-2">
            <!-- 计算结果区域 -->
            <div class="result-container">
              <h2 class="section-title">🎯 计算结果</h2>
              <div id="resultArea" class="result-area">
                <div class="result-placeholder">
                  <p>请设置参数并点击"开始计算"</p>
                </div>
              </div>

              <!-- 交易日历转换器 -->
              <div class="calendar-converter-section" style="margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                <h3 style="font-size: 1rem; margin-bottom: 10px; color: #4a5568;">📅 交易日历转换器</h3>
                <div class="calendar-converter">
                  <div class="input-group" style="margin-bottom: 10px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #2d3748; font-size: 0.85rem;">交易天数</label>
                    <input type="number" id="tradingDaysInput" min="1" max="50000"
                           placeholder="输入交易天数"
                           style="width: 100%; padding: 6px 8px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 0.85rem;">
                  </div>
                  <div class="conversion-results" id="conversionResults">
                    <div class="conversion-item">
                      <span class="conversion-label">月数：</span>
                      <span class="conversion-value" id="monthsResult">-</span>
                    </div>
                    <div class="conversion-item">
                      <span class="conversion-label">年数：</span>
                      <span class="conversion-value" id="yearsResult">-</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>

          <!-- 第3象限：优化建议 -->
          <div class="quadrant quadrant-3">
            <div class="section-header">
              <h2 class="section-title">💡 优化建议（系统默认）</h2>
              <div class="custom-template-container">
                <button id="customTemplateToggle" class="custom-template-toggle">
                  🎛️ 自定义优化模板 <span class="toggle-icon">▼</span>
                </button>
                <div id="customTemplatePanel" class="custom-template-panel hidden">
                  <div class="template-header">
                    <h3>个性化难度评估</h3>
                    <p>根据您的实际情况调整各项优化的难度偏好</p>
                    <div class="template-actions-top">
                      <button id="loadCurrentParams" class="btn-load-params">📊 获取当前参数</button>
                      <span id="paramsStatus" class="params-status">请先获取当前参数</span>
                    </div>
                  </div>
                  <div id="difficultySettings" class="difficulty-settings">
                    <div class="params-placeholder">
                      <p>👆 请先点击"获取当前参数"按钮，系统将基于您输入的参数生成个性化的难度评估问题</p>
                    </div>
                  </div>
                  <div class="template-actions">
                    <button id="saveCustomTemplate" class="btn-save">保存设置</button>
                    <button id="resetToDefault" class="btn-reset">重置为默认</button>
                    <button id="collapsePersonalization" class="btn-collapse" title="收起页面">
                      <span class="collapse-arrow">▲</span>
                    </button>
                  </div>
                  <div class="personalized-calculation">
                    <div class="calculation-info">
                      <h4>🎯 个性化计算</h4>
                      <p>基于您的难度偏好进行智能加权计算和画像匹配</p>
                    </div>
                    <button id="personalizedCalculate" class="btn-personalized-calc" disabled>
                      <span class="calc-icon">🧮</span>
                      <span class="calc-text">个性化计算</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div id="suggestionArea" class="suggestion-area">
              <div class="suggestion-placeholder">
                <p>计算完成后将显示优化建议</p>
              </div>
            </div>
          </div>

          <!-- 第4象限：智能组合推荐 -->
          <div class="quadrant quadrant-4">
            <h2 class="section-title">🎯 智能组合推荐</h2>
            <div id="combinationArea" class="combination-area">
              <div class="combination-placeholder">
                <p>计算完成后将显示组合推荐</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `}bindEvents(){document.getElementById("calculateBtn").addEventListener("click",()=>this.calculate());const t=document.getElementById("tradingDaysInput");t.addEventListener("input",()=>this.updateCalendarConversion()),t.addEventListener("change",()=>this.updateCalendarConversion()),this.bindInterestCalculatorEvents(),this.bindCustomTemplateEvents()}bindInterestCalculatorEvents(){const e=document.getElementById("interestTargetAmount"),t=document.getElementById("interestRate");e.addEventListener("input",()=>this.calculateInterest()),e.addEventListener("change",()=>this.calculateInterest()),t.addEventListener("input",()=>this.calculateInterest()),t.addEventListener("change",()=>this.calculateInterest()),this.calculateInterest()}calculateInterest(){const e=parseFloat(document.getElementById("interestTargetAmount").value)||0,t=parseFloat(document.getElementById("interestRate").value)||0;if(e<=0||t<0){document.getElementById("dailyInterest").textContent="-",document.getElementById("monthlyInterest").textContent="-",document.getElementById("yearlyInterest").textContent="-";return}const i=e,a=t/100/365,s=t/100/12,n=i*a,o=i*s,l=i*(t/100);document.getElementById("dailyInterest").textContent=`${n.toFixed(2)}万元 (${(n*1e4).toFixed(0)}元)`,document.getElementById("monthlyInterest").textContent=`${o.toFixed(2)}万元 (${(o*1e4).toFixed(0)}元)`,document.getElementById("yearlyInterest").textContent=`${l.toFixed(2)}万元 (${(l*1e4).toFixed(0)}元)`}bindCustomTemplateEvents(){const e=document.getElementById("customTemplateToggle"),t=document.getElementById("customTemplatePanel"),i=document.getElementById("saveCustomTemplate"),a=document.getElementById("resetToDefault"),s=document.getElementById("collapsePersonalization"),n=document.getElementById("loadCurrentParams"),o=document.getElementById("personalizedCalculate");e.addEventListener("click",()=>{t.classList.contains("hidden")?(t.classList.remove("hidden"),e.classList.add("active")):(t.classList.add("hidden"),e.classList.remove("active"))}),n.addEventListener("click",()=>{this.loadCurrentParamsAndGenerateQuestions()}),i.addEventListener("click",()=>{this.saveCustomDifficulties(),document.querySelector(".suggestion-item")&&this.regenerateRecommendations()}),a.addEventListener("click",()=>{this.userProfile.resetToDefault(),this.initializeDifficultySettings(),document.querySelector(".suggestion-item")&&this.regenerateRecommendations()}),s.addEventListener("click",()=>{t.classList.add("hidden"),e.classList.remove("active")}),o.addEventListener("click",()=>{this.performPersonalizedCalculation()}),document.addEventListener("click",l=>{!e.contains(l.target)&&!t.contains(l.target)&&(t.classList.add("hidden"),e.classList.remove("active"))})}loadCurrentParamsAndGenerateQuestions(){const e=this.getCurrentParams();if(!e){this.showNotification("请先填写交易参数！","error");return}const t=document.getElementById("paramsStatus"),i=document.getElementById("loadCurrentParams");t.textContent="✅ 参数已获取，正在生成个性化问题...",t.classList.add("loaded"),i.disabled=!0,setTimeout(()=>{this.generatePersonalizedQuestions(e),t.textContent="✅ 个性化问题已生成",i.textContent="🔄 重新获取参数",i.disabled=!1},500)}generatePersonalizedQuestions(e){const t=document.getElementById("difficultySettings"),i=this.createPersonalizedQuestions(e),a={};i.forEach(n=>{a[n.category]||(a[n.category]=[]),a[n.category].push(n)});let s="";Object.entries(a).forEach(([n,o])=>{s+=`
        <div class="difficulty-category">
          <h4 style="font-size: 0.9rem; font-weight: 600; color: #4a5568; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0;">
            ${n}
          </h4>
          ${o.map(l=>this.createDifficultyItem(l)).join("")}
        </div>
      `}),t.innerHTML=s,t.querySelectorAll(".difficulty-slider").forEach(n=>{n.addEventListener("input",o=>{o.target.dataset.key;const l=parseInt(o.target.value),r=o.target.parentNode.querySelector(".difficulty-value");r.textContent=this.getDifficultyText(l)})})}createPersonalizedQuestions(e){const t=[],i=e.initialCapital;t.push({key:"initialCapital_50%",label:"增加50%初始本金",description:`从${i}万元增加到${i*1.5}万元`,category:"💰 资金相关"},{key:"initialCapital_100%",label:"翻倍初始本金",description:`从${i}万元增加到${i*2}万元`,category:"💰 资金相关"},{key:"initialCapital_200%",label:"增加3倍初始本金",description:`从${i}万元增加到${i*3}万元`,category:"💰 资金相关"});const a=e.avgProfitRate*100,s=e.winRate*100;t.push({key:"profitRate_8%",label:"提升盈利率到8%",description:`从${a.toFixed(1)}%提升到8%`,category:"📈 技能相关"},{key:"profitRate_10%",label:"提升盈利率到10%",description:`从${a.toFixed(1)}%提升到10%`,category:"📈 技能相关"},{key:"winRate_70%",label:"提升胜率到70%",description:`从${s.toFixed(0)}%提升到70%`,category:"📈 技能相关"},{key:"winRate_80%",label:"提升胜率到80%",description:`从${s.toFixed(0)}%提升到80%`,category:"📈 技能相关"});const n=e.avgLossRate*100,o=e.positionSize*100;return t.push({key:"lossRate_1.5%",label:"降低亏损率到1.5%",description:`从${n.toFixed(1)}%降低到1.5%`,category:"🛡️ 风险控制"},{key:"positionSize_50%",label:"提升仓位到50%",description:`从${o.toFixed(0)}%提升到50%`,category:"🛡️ 风险控制"}),t}initializeDifficultySettings(){const e=document.getElementById("difficultySettings"),t=this.userProfile.getDifficultyConfig(),i={};t.forEach(s=>{i[s.category]||(i[s.category]=[]),i[s.category].push(s)});let a="";Object.entries(i).forEach(([s,n])=>{a+=`
        <div class="difficulty-category">
          <h4 style="font-size: 0.9rem; font-weight: 600; color: #4a5568; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0;">
            ${s}
          </h4>
          ${n.map(o=>this.createDifficultyItem(o)).join("")}
        </div>
      `}),e.innerHTML=a,e.querySelectorAll(".difficulty-slider").forEach(s=>{s.addEventListener("input",n=>{n.target.dataset.key;const o=parseInt(n.target.value),l=n.target.parentNode.querySelector(".difficulty-value");l.textContent=this.getDifficultyText(o)})})}createDifficultyItem(e){const t=this.userProfile.getDifficulty(e.key);return`
      <div class="difficulty-item">
        <label class="difficulty-label">${e.label}</label>
        <div class="difficulty-description">${e.description}</div>
        <div class="difficulty-slider-container">
          <input type="range"
                 class="difficulty-slider"
                 min="1"
                 max="10"
                 value="${t}"
                 data-key="${e.key}">
          <div class="difficulty-value">${this.getDifficultyText(t)}</div>
        </div>
        <div class="difficulty-labels">
          <span>很容易</span>
          <span>很困难</span>
        </div>
      </div>
    `}getDifficultyText(e){return{1:"很容易",2:"容易",3:"较容易",4:"一般",5:"中等",6:"较难",7:"困难",8:"很困难",9:"极困难",10:"几乎不可能"}[e]||"中等"}saveCustomDifficulties(){document.querySelectorAll(".difficulty-slider").forEach(i=>{const a=i.dataset.key,s=parseInt(i.value);this.userProfile.setDifficulty(a,s)}),this.userProfile.setCustomMode(!0);const t=document.getElementById("personalizedCalculate");t&&(t.disabled=!1),this.showNotification("自定义设置已保存！现在可以进行个性化计算","success")}showNotification(e,t="info"){const i=document.createElement("div");i.className=`notification notification-${t}`,i.textContent=e;let a;switch(t){case"success":a="#10b981";break;case"error":a="#ef4444";break;default:a="#3b82f6";break}i.style.cssText=`
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${a};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-size: 0.9rem;
      font-weight: 500;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `,document.body.appendChild(i),setTimeout(()=>{i.style.transform="translateX(0)"},100),setTimeout(()=>{i.style.transform="translateX(100%)",setTimeout(()=>{i.parentNode&&i.parentNode.removeChild(i)},300)},2e3)}regenerateRecommendations(){this.getCurrentParams()&&console.log("重新生成推荐，使用自定义难度配置")}getCurrentParams(){try{return{initialCapital:parseFloat(document.getElementById("initialCapital").value),targetAmount:parseFloat(document.getElementById("targetAmount").value),dailyTrades:parseFloat(document.getElementById("dailyTrades").value),positionSize:parseFloat(document.getElementById("positionSize").value)/100,winRate:parseFloat(document.getElementById("winRate").value)/100,avgProfitRate:parseFloat(document.getElementById("avgProfitRate").value)/100,avgLossRate:parseFloat(document.getElementById("avgLossRate").value)/100}}catch{return null}}async performPersonalizedCalculation(){const e=document.getElementById("personalizedCalculate"),t=e.querySelector(".calc-icon"),i=e.querySelector(".calc-text");if(!document.querySelector(".result-card")){this.showNotification("请先进行基础计算！","error");return}e.disabled=!0,e.classList.add("calculating"),t.textContent="⚙️",i.textContent="个性化计算中...";try{const a=this.getCurrentParams(),s=this.getCurrentCalculationResult();if(!a||!s)throw new Error("无法获取计算参数或结果");await this.performPersonalizedAnalysis(a,s),this.updateTitleToPersonalized(),e.classList.remove("calculating"),e.classList.add("success"),t.textContent="✅",i.textContent="个性化计算完成",this.showNotification("个性化计算完成！推荐已根据您的偏好调整","success");const n=document.getElementById("customTemplatePanel"),o=document.getElementById("customTemplateToggle");n.classList.add("hidden"),o.classList.remove("active")}catch(a){console.error("个性化计算失败:",a),this.showNotification("个性化计算失败，请重试","error"),e.classList.remove("calculating"),t.textContent="🧮",i.textContent="个性化计算",e.disabled=!1}}getCurrentCalculationResult(){try{const e=document.querySelector(".result-value.primary");return e?{tradingDays:parseInt(e.textContent)}:null}catch{return null}}async performPersonalizedAnalysis(e,t){await new Promise(a=>setTimeout(a,2e3));const i=this.createPersonalizedUserProfile(e);await this.generatePersonalizedRecommendations(e,t.tradingDays,i)}createPersonalizedUserProfile(e){return{capitalLevel:this.assessCapitalLevel(e.initialCapital),skillLevel:this.assessSkillLevel(e),riskTolerance:this.assessRiskTolerance(e),optimizationStyle:"personalized",customDifficulties:this.userProfile.customDifficulties,personalizedWeights:this.calculatePersonalizedWeights()}}calculatePersonalizedWeights(){const e=this.userProfile.customDifficulties,t={};return Object.keys(e).forEach(i=>{const a=e[i];t[i]=Math.max(.1,(11-a)/10)}),t}assessCapitalLevel(e){return e<5?"low":e<20?"medium":e<50?"high":"very_high"}assessSkillLevel(e){const t=e.avgProfitRate,i=e.winRate;return t>=.08&&i>=.7?"expert":t>=.06&&i>=.65?"advanced":t>=.04&&i>=.6?"intermediate":"beginner"}assessRiskTolerance(e){const t=e.positionSize,i=e.avgLossRate;return t>=.5&&i<=.02?"high":t>=.3&&i<=.03?"medium":"low"}getCapitalLevelText(e){return{low:"小额资金",medium:"中等资金",high:"较大资金",very_high:"大额资金"}[e]||"中等资金"}getSkillLevelText(e){return{beginner:"初级",intermediate:"中级",advanced:"高级",expert:"专家级"}[e]||"中级"}getStyleConfig(e){const t={conservative:{name:"保守型",description:"稳健策略，优先控制风险",color:"#10b981",icon:"🛡️",maxParams:3,minFeasibility:.6},balanced:{name:"平衡型",description:"平衡风险收益",color:"#3b82f6",icon:"⚖️",maxParams:4,minFeasibility:.4},aggressive:{name:"激进型",description:"追求最快收益",color:"#ef4444",icon:"🚀",maxParams:5,minFeasibility:.2}};return t[e]||t.balanced}async simulateWithParams(e){const{initialCapital:t,targetAmount:i,avgProfitRate:a,avgLossRate:s,winRate:n,positionSize:o,dailyTrades:l}=e;let r=t,d=0;const c=2e3;for(;r<i&&d<c;){const p=this.calculateDailyReturn(a,s,n,o,l);r*=1+p,d++}return{success:r>=i,tradingDays:d,finalCapital:r}}calculateDailyReturn(e,t,i,a,s){return(i*e-(1-i)*t)*a*s}async generatePersonalizedParameterAnalysis(e,t,i){const a=[],s=["initialCapital","winRate","profitRate","lossRate","position","dailyTrades"];for(const n of s){const o=await this.analyzeParameterImpactWithPersonalizedWeights(n,e,t,i);a.push(o)}return a.sort((n,o)=>o.personalizedScore-n.personalizedScore),a}async analyzeParameterImpactWithPersonalizedWeights(e,t,i,a){const s=await this.analyzeParameterImpact(e,t,i,a),n=a.personalizedWeights;s.scenarios.forEach(r=>{const d=this.getWeightKeyForScenario(e,r),c=n[d]||.5;r.personalizedFeasibility=Math.min(1,r.feasibility*(c*2)),r.personalizedImpact=r.impact*r.personalizedFeasibility});const o=Math.max(...s.scenarios.map(r=>r.personalizedImpact)),l=s.scenarios.reduce((r,d)=>r+d.personalizedFeasibility,0)/s.scenarios.length;return s.personalizedScore=o*l,s.maxPersonalizedImpact=o,s.avgPersonalizedFeasibility=l,s}getWeightKeyForScenario(e,t){switch(e){case"initialCapital":if(t.description.includes("50%"))return"initialCapital_50%";if(t.description.includes("翻倍"))return"initialCapital_100%";if(t.description.includes("3倍"))return"initialCapital_200%";break;case"profitRate":if(t.description.includes("8%"))return"profitRate_8%";if(t.description.includes("10%"))return"profitRate_10%";break;case"winRate":if(t.description.includes("70%"))return"winRate_70%";if(t.description.includes("80%"))return"winRate_80%";break;case"lossRate":if(t.description.includes("1.5%"))return"lossRate_1.5%";break;case"position":if(t.description.includes("50%"))return"positionSize_50%";break}return"initialCapital_50%"}async generatePersonalizedRecommendations(e,t,i){const a=await this.generatePersonalizedParameterAnalysis(e,t,i);this.updateOptimizationSuggestions(a,i);const s=await this.generatePersonalizedCombinations(e,t,i,a);this.updateCombinationRecommendations(s)}updateOptimizationSuggestions(e,t){const i=document.getElementById("suggestionArea");if(!i)return;let a=`
      <div class="suggestion-content">
        <div class="suggestion-header">
          <h3>📊 智能参数优化分析（个性化模式）</h3>
          <p>基于您的个性化偏好，按个性化评分排序（影响程度 × 个人可行性）</p>
          <div class="profile-info">
            <div class="profile-item">
              <span class="profile-label">优化模式：</span>
              <span class="profile-value personalized">个性化模式 - 基于您的难度偏好</span>
            </div>
            <div class="profile-item">
              <span class="profile-label">资金水平：${this.getCapitalLevelText(t.capitalLevel)}</span>
              <span class="profile-label">交易技能：${this.getSkillLevelText(t.skillLevel)}</span>
            </div>
          </div>
        </div>
        <div class="suggestion-list">
    `;e.forEach((s,n)=>{a+=this.createPersonalizedSuggestionItem(s,n+1)}),a+=`
        </div>
      </div>
    `,i.innerHTML=a,this.bindParameterCardEvents()}createPersonalizedSuggestionItem(e,t){const i=e.scenarios.filter(a=>a.personalizedImpact>0);return i.length===0?"":`
      <div class="suggestion-item personalized" data-parameter="${e.type}">
        <div class="suggestion-header" data-toggle="suggestion-${t}">
          <div class="suggestion-rank personalized">#${t}</div>
          <div class="suggestion-info">
            <div class="suggestion-title">${e.name}</div>
            <div class="suggestion-current">当前：${e.currentValue}</div>
          </div>
          <div class="suggestion-metrics personalized">
            <div class="metric-item">
              <span class="metric-label">最大影响：${Math.round(e.maxPersonalizedImpact)}天</span>
              <span class="metric-label">个人可行性：${Math.round(e.avgPersonalizedFeasibility*100)}%</span>
              <span class="metric-label personalized">个性化评分：${Math.round(e.personalizedScore)}</span>
            </div>
          </div>
          <div class="suggestion-toggle">▼</div>
        </div>
        <div class="suggestion-details" id="suggestion-${t}">
          ${i.map(a=>this.createPersonalizedScenarioItem(a)).join("")}
        </div>
      </div>
    `}createPersonalizedScenarioItem(e){const t=(e.improvement*100).toFixed(1),i=Math.round(e.personalizedFeasibility*100);return`
      <div class="scenario-item personalized">
        <div class="scenario-header">
          <div class="scenario-title">${e.description}</div>
          <div class="scenario-metrics">
            <span class="scenario-impact">节省${e.daysSaved}天</span>
            <span class="scenario-difficulty personalized">个人难度：${this.getPersonalizedDifficultyText(e.personalizedFeasibility)}</span>
          </div>
        </div>
        <div class="scenario-details">
          <div class="scenario-change">${e.newValue}</div>
          <div class="scenario-result">
            <div class="result-text">优化后：${e.newDays}天 (${this.formatDetailedTime(e.newDays)})</div>
            <div class="improvement-text personalized">个性化提升效果：${t}% (可行性：${i}%)</div>
          </div>
        </div>
      </div>
    `}getPersonalizedDifficultyText(e){return e>=.8?"很容易":e>=.6?"容易":e>=.4?"中等":e>=.2?"困难":"很困难"}async generatePersonalizedCombinations(e,t,i,a){const s={conservative:null,moderate:null,aggressive:null};for(const n of Object.keys(s))s[n]=await this.generatePersonalizedOptimalCombination(n,e,t,i,a);return s}async generatePersonalizedOptimalCombination(e,t,i,a,s){const n=this.getStyleConfig(e),o={...t},l=[];let r=1;const d=[...s].sort((y,u)=>u.personalizedScore-y.personalizedScore);let c=0;const p=n.maxParams||5;for(const y of d){if(c>=p)break;const u=y.scenarios.filter(m=>m.personalizedImpact>0).sort((m,h)=>h.personalizedImpact-m.personalizedImpact)[0];u&&u.personalizedFeasibility>=n.minFeasibility&&(Object.assign(o,u.params),l.push({parameter:y.name,from:y.currentValue,to:u.newValue,impact:u.daysSaved,difficulty:this.getPersonalizedDifficultyText(u.personalizedFeasibility),personalizedFeasibility:u.personalizedFeasibility}),r*=u.personalizedFeasibility,c++)}const v=await this.simulateWithParams(o);return{style:e,styleConfig:n,params:o,result:v,adjustments:l,personalizedFeasibility:r,isPersonalized:!0}}updateCombinationRecommendations(e){const t=document.querySelector("#combinationArea .combination-content");if(!t)return;let i=`
      <div class="combination-header">
        <h3>🎯 智能组合推荐（个性化模式）</h3>
        <p>基于您的个性化偏好，为您推荐三种风格的最优参数组合</p>
      </div>
      <div class="combination-grid">
    `;Object.values(e).forEach(a=>{a&&a.result&&a.result.success&&(i+=this.createPersonalizedCombinationCard(a))}),i+=`
      </div>
    `,t.innerHTML=i,this.addCombinationEventListeners(e)}createPersonalizedCombinationCard(e){const{style:t,styleConfig:i,result:a,adjustments:s,personalizedFeasibility:n}=e,o=Math.max(0,468-a.tradingDays),l=(o/468*100).toFixed(1),r=this.formatDetailedTime(a.tradingDays);return`
      <div class="combination-card personalized ${t}" data-style="${t}">
        <div class="combination-header">
          <div class="combination-icon" style="background: ${i.color}20; color: ${i.color}">
            ${i.icon}
          </div>
          <div class="combination-title">
            <h4 style="color: ${i.color}">${i.name}</h4>
            <p class="combination-description">${i.description}</p>
          </div>
        </div>

        <div class="combination-results personalized">
          <div class="result-summary">
            <div class="result-highlight">
              <span class="result-days">节省 ${o} 天</span>
              <span class="result-improvement">提升 ${l}%</span>
            </div>
            <div class="result-detail">优化后：${a.tradingDays}天 (${r})</div>
          </div>

          <div class="result-metrics personalized">
            <div class="metric-item">
              <span class="metric-label">个人可行性</span>
              <span class="metric-value">${Math.round(n*100)}%</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">难度</span>
              <span class="metric-value">${this.getPersonalizedDifficultyText(n)}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">参数调整</span>
              <span class="metric-value">${s.length}项</span>
            </div>
          </div>
        </div>

        <div class="combination-changes personalized">
          <h5>主要调整：</h5>
          <div class="change-list">
            ${s.slice(0,3).map(d=>`
              <div class="change-item personalized">
                <span class="change-param">${d.parameter}</span>
                <span class="change-arrow">→</span>
                <span class="change-value">${d.to}</span>
                <span class="change-difficulty personalized">${d.difficulty}</span>
              </div>
            `).join("")}
            ${s.length>3?`<div class="more-changes">+${s.length-3}项更多调整</div>`:""}
          </div>
        </div>

        <div class="combination-actions">
          <button class="btn-apply personalized" data-style="${t}">
            应用此方案
          </button>
          <button class="btn-details" data-style="${t}">
            查看详情
          </button>
        </div>
      </div>
    `}updateTitleToPersonalized(){const e=document.querySelector(".section-title");e&&e.textContent.includes("系统默认")&&(e.textContent="💡 优化建议（个性化模式）")}calculate(){const e={initialCapital:parseFloat(document.getElementById("initialCapital").value),targetAmount:parseFloat(document.getElementById("targetAmount").value),dailyTrades:parseFloat(document.getElementById("dailyTrades").value),positionSize:parseFloat(document.getElementById("positionSize").value)/100,winRate:parseFloat(document.getElementById("winRate").value)/100,avgProfitRate:parseFloat(document.getElementById("avgProfitRate").value)/100,avgLossRate:parseFloat(document.getElementById("avgLossRate").value)/100};if(!this.validateParams(e))return;const t=document.getElementById("resultArea");t.innerHTML=`
      <div class="loading">
        <div class="loading-spinner"></div>
        <p>正在计算中...</p>
      </div>
    `,setTimeout(async()=>{try{const i=await this.simulateTrading(e);this.displayResult(i)}catch(i){console.error("计算错误:",i),this.displayResult({success:!1,reason:"计算过程中出现错误: "+i.message,suggestion:"请检查输入参数并重试"})}},1e3)}validateParams(e){return e.initialCapital>=e.targetAmount?(alert("目标金额必须大于初始本金"),!1):e.winRate<0||e.winRate>1?(alert("胜率必须在0-100%之间"),!1):!0}async simulateTrading(e){const t=new M,i=new z(t);try{const{params:a,validation:s}=t.preprocessAndValidate(e);if(!s.isValid)return{success:!1,reason:s.issues[0].message,suggestion:s.issues[0].suggestion,riskLevel:s.riskLevel};const n=await i.runSimulation(a,{minIterations:500,maxIterations:2e3,confidenceLevel:.95});return this.processSimulationResult(n,s)}catch(a){return console.error("Simulation error:",a),{success:!1,reason:"计算过程中出现错误",suggestion:"请检查输入参数并重试"}}}processSimulationResult(e,t){if(!e.success)return{success:!1,reason:e.reason,riskLevel:t.riskLevel,warnings:t.warnings};const i=e.statistics.median;return{success:!0,tradingDays:Math.round(i),tradingMonths:Math.round(i/21),tradingYears:Math.round(i/250*10)/10,finalCapital:e.expectedFinalCapital,statistics:{successRate:e.successRate,confidence:e.confidence,range:{best:Math.round(e.statistics.p25),worst:Math.round(e.statistics.p75),mean:Math.round(e.statistics.mean)}},riskAssessment:{level:e.riskLevel,maxDrawdown:e.riskMetrics.maxDrawdown,bankruptcyRisk:e.riskMetrics.bankruptcyRate,warnings:t.warnings},recommendations:this.generateRecommendations(e,t)}}generateRecommendations(e,t){const i=[];return e.successRate<.8&&i.push("建议提高胜率或降低仓位以增加成功概率"),e.riskMetrics.maxDrawdown>.3&&i.push("最大回撤较大，建议设置止损保护"),(t.riskLevel==="high"||t.riskLevel==="very-high")&&i.push("当前策略风险较高，建议降低仓位或提高胜率"),i}displayResult(e){const t=document.getElementById("resultArea");if(this.generateOptimizationSuggestions(e),!e.success){const r=e.reason||"未知错误",d=e.suggestion||"请检查输入参数";t.innerHTML=`
        <div class="error">
          <div class="error-icon">⚠️</div>
          <h3 class="error-title">计算失败</h3>
          <p class="error-message">${r}</p>
          ${`<p class="error-suggestion" style="margin-top: 10px; font-size: 0.9rem; color: #666;">${d}</p>`}
          ${e.riskLevel?`<p style="margin-top: 10px; font-size: 0.9rem; color: #e53e3e;">风险等级: ${this.getRiskLevelText(e.riskLevel)}</p>`:""}
        </div>
      `,this.clearChartArea();return}const i=Math.round(e.tradingDays/21),a=Math.round(i/12*10)/10,s=Math.floor(i/12),n=i%12,o=Math.round(e.tradingDays%21*(30/21));let l="";s>0&&(l+=s+"年"),n>0&&(l+=n+"个月"),o>0&&(l+=o+"天"),l===""&&(l="0天"),t.innerHTML=`
      <div class="result-success">
        <h3 class="result-title">🎯 达到目标需要：</h3>

        <div class="result-grid">
          <div class="result-card primary">
            <div class="result-value primary">${e.tradingDays}</div>
            <div class="result-label">交易天数</div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="result-card success">
              <div class="result-value success">${i}</div>
              <div class="result-label">自然月数</div>
            </div>
            <div class="result-card purple">
              <div class="result-value purple">${a}年 (${l})</div>
              <div class="result-label">自然年数</div>
            </div>
          </div>

          <div class="result-card gray result-final">
            <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 5px;">最终资金</div>
            <div class="result-value gray">${e.finalCapital.toFixed(2)} 万元</div>
          </div>
        </div>

        <!-- 可视化分析区域 - 整合到结果中 -->
        <div class="visualization-section" style="margin-top: 25px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
          <h4 style="font-size: 1.1rem; margin-bottom: 15px; color: #4a5568; display: flex; align-items: center; gap: 8px;">
            📈 可视化分析
          </h4>
          <div id="chartArea" class="chart-area">
            <div class="chart-placeholder">
              <p style="color: #718096; font-size: 0.9rem;">图表加载中...</p>
            </div>
          </div>
        </div>
      </div>
    `,this.renderCharts(e)}getRiskLevelText(e){return{low:"低风险",medium:"中等风险",high:"高风险","very-high":"极高风险"}[e]||"未知风险"}updateCalendarConversion(){const e=document.getElementById("tradingDaysInput"),t=parseInt(e.value);if(!t||t<=0){document.getElementById("monthsResult").textContent="-",document.getElementById("yearsResult").textContent="-";return}const a=Math.round(t/21),s=Math.round(a/12*10)/10,n=Math.floor(a/12),o=a%12,l=Math.round(t%21*(30/21));let r="";n>0&&(r+=n+"年"),o>0&&(r+=o+"个月"),l>0&&(r+=l+"天"),r===""&&(r="0天"),document.getElementById("monthsResult").textContent=a+"个月",document.getElementById("yearsResult").textContent=s+"年 ("+r+")",document.querySelectorAll(".conversion-value").forEach(c=>{c.classList.add("highlight"),setTimeout(()=>c.classList.remove("highlight"),300)})}clearChartArea(){const e=document.getElementById("chartArea");e.innerHTML=`
      <div class="chart-placeholder">
        <p>计算完成后将显示图表分析</p>
      </div>
    `}renderCharts(e){const t=document.getElementById("chartArea");t.innerHTML=`
      <div class="chart-tabs">
        <button class="chart-tab active" data-chart="growth">资金增长</button>
        <button class="chart-tab" data-chart="risk">风险分析</button>
        <button class="chart-tab" data-chart="probability">概率分布</button>
      </div>
      <div class="chart-container">
        <canvas id="mainChart" width="400" height="300"></canvas>
      </div>
    `;const i=t.querySelectorAll(".chart-tab");i.forEach(a=>{a.addEventListener("click",s=>{i.forEach(n=>n.classList.remove("active")),s.target.classList.add("active"),this.switchChart(s.target.dataset.chart,e)})}),this.switchChart("growth",e)}switchChart(e,t){const a=document.getElementById("mainChart").getContext("2d");switch(this.currentChart&&this.currentChart.destroy(),e){case"growth":this.renderGrowthChart(a,t);break;case"risk":this.renderRiskChart(a,t);break;case"probability":this.renderProbabilityChart(a,t);break}}renderGrowthChart(e,t){const i=t.tradingDays,a=10,s=100,n=[],o=[];for(let l=0;l<=i;l+=Math.max(1,Math.floor(i/50))){const r=l/i,d=a+(s-a)*r;n.push(d),o.push(l)}this.currentChart=new Chart(e,{type:"line",data:{labels:o,datasets:[{label:"资金增长 (万元)",data:n,borderColor:"#667eea",backgroundColor:"rgba(102, 126, 234, 0.1)",fill:!0,tension:.4},{label:"目标线",data:Array(o.length).fill(s),borderColor:"#48bb78",borderDash:[5,5],fill:!1}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{title:{display:!0,text:"资金增长预测曲线"},legend:{position:"top"}},scales:{x:{title:{display:!0,text:"交易天数"}},y:{title:{display:!0,text:"资金 (万元)"}}}}})}renderRiskChart(e,t){const i={labels:["成功概率","失败概率"],datasets:[{data:[t.statistics?.successRate*100||85,(1-(t.statistics?.successRate||.85))*100],backgroundColor:["#48bb78","#f56565"],borderWidth:2,borderColor:"#fff"}]};this.currentChart=new Chart(e,{type:"doughnut",data:i,options:{responsive:!0,maintainAspectRatio:!1,plugins:{title:{display:!0,text:"成功概率分析"},legend:{position:"bottom"}}}})}renderProbabilityChart(e,t){const i=t.tradingDays,a=i*.3,s=[],n=[];for(let o=Math.max(1,i-2*a);o<=i+2*a;o+=Math.floor(a/10)){s.push(Math.round(o));const l=Math.exp(-.5*Math.pow((o-i)/a,2));n.push(l)}this.currentChart=new Chart(e,{type:"bar",data:{labels:s,datasets:[{label:"概率密度",data:n,backgroundColor:"rgba(159, 122, 234, 0.6)",borderColor:"#9f7aea",borderWidth:1}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{title:{display:!0,text:"达到目标时间概率分布"},legend:{display:!1}},scales:{x:{title:{display:!0,text:"交易天数"}},y:{title:{display:!0,text:"相对概率"}}}}})}getInputParams(){return{initialCapital:parseFloat(document.getElementById("initialCapital").value),targetAmount:parseFloat(document.getElementById("targetAmount").value),dailyTrades:parseFloat(document.getElementById("dailyTrades").value),positionSize:parseFloat(document.getElementById("positionSize").value)/100,winRate:parseFloat(document.getElementById("winRate").value)/100,avgProfitRate:parseFloat(document.getElementById("avgProfitRate").value)/100,avgLossRate:parseFloat(document.getElementById("avgLossRate").value)/100}}async generateOptimizationSuggestions(e){const t=this.getInputParams(),i=e.tradingDays,a=this.analyzeUserProfile(t),s=[],n=await this.analyzeParameterImpact("initialCapital",t,i,a);s.push(n);const o=await this.analyzeParameterImpact("winRate",t,i,a);s.push(o);const l=await this.analyzeParameterImpact("profitRate",t,i,a);s.push(l);const r=await this.analyzeParameterImpact("lossRate",t,i,a);s.push(r);const d=await this.analyzeParameterImpact("position",t,i,a);s.push(d);const c=await this.analyzeParameterImpact("dailyTrades",t,i,a);s.push(c),s.sort((p,v)=>v.overallScore-p.overallScore),this.displayParameterImpactAnalysis(s,a),setTimeout(async()=>{try{const p=await this.generateSmartCombinations(t,i,a,s);this.displaySmartCombinations(p,a)}catch(p){console.error("🎯 智能组合推荐生成失败:",p)}},100)}analyzeUserProfile(e){const t={capitalLevel:this.getCapitalLevel(e.initialCapital),skillLevel:this.getSkillLevel(e),riskTolerance:this.getRiskTolerance(e),optimizationMode:""};return t.capitalLevel==="low"&&t.skillLevel==="beginner"?t.optimizationMode="conservative":t.capitalLevel==="high"&&t.skillLevel==="advanced"?t.optimizationMode="aggressive":t.capitalLevel==="high"&&t.skillLevel==="beginner"?t.optimizationMode="capital-focused":t.capitalLevel==="low"&&t.skillLevel==="advanced"?t.optimizationMode="skill-focused":t.optimizationMode="balanced",t}getCapitalLevel(e){return e<=5?"low":e<=20?"medium":e<=100?"high":"very-high"}getSkillLevel(e){const t=e.winRate*100,i=e.avgProfitRate*100,a=e.avgLossRate*100,s=i/a;let n=0;return t>=70?n+=3:t>=60?n+=2:t>=50&&(n+=1),s>=2?n+=3:s>=1.5?n+=2:s>=1&&(n+=1),i>=8?n+=2:i>=5&&(n+=1),n>=6?"advanced":n>=3?"intermediate":"beginner"}getRiskTolerance(e){const t=e.positionSize*100,i=e.avgLossRate*100;return t>=40||i>=4?"high":t>=25||i>=2.5?"medium":"low"}async analyzeCapitalOptimization(e,t){const i=[],a=[e.initialCapital*1.5,e.initialCapital*2,e.initialCapital*3];for(const s of a){if(s<=e.initialCapital)continue;const n={...e,initialCapital:s},o=await this.simulateWithParams(n);if(o&&o.success&&o.tradingDays<t){const l=t-o.tradingDays,r=(l/t*100).toFixed(1);i.push({type:"capital",title:"增加本金",description:`本金从${e.initialCapital}万增加到${s}万`,newValue:s,oldValue:e.initialCapital,newDays:o.tradingDays,daysSaved:l,improvement:r,impact:l,priority:l>100?"high":l>50?"medium":"low"})}}return i}async analyzeWinRateOptimization(e,t){const i=[],a=e.winRate*100,s=[a+5,a+10,a+15];for(const n of s){if(n>85||n<=a)continue;const o={...e,winRate:n/100},l=await this.simulateWithParams(o);if(l&&l.success&&l.tradingDays<t){const r=t-l.tradingDays,d=(r/t*100).toFixed(1);i.push({type:"winRate",title:"提升胜率",description:`胜率从${a.toFixed(0)}%提升到${n}%`,newValue:n,oldValue:a,newDays:l.tradingDays,daysSaved:r,improvement:d,impact:r,priority:r>100?"high":r>50?"medium":"low"})}}return i}analyzeProfitRateOptimization(e,t){const i=[];return[e.profitRate+1,e.profitRate+2,e.profitRate+3].forEach(s=>{if(s>10||s<=e.profitRate)return;const n={...e,profitRate:s},o=this.simulateWithParams(n);if(o&&o.tradingDays<t){const l=t-o.tradingDays,r=(l/t*100).toFixed(1);i.push({type:"profitRate",title:"提升盈利率",description:`盈利率从${e.profitRate}%提升到${s}%`,newValue:s,oldValue:e.profitRate,newDays:o.tradingDays,daysSaved:l,improvement:r,impact:l,priority:l>100?"high":l>50?"medium":"low"})}}),i}analyzeLossRateOptimization(e,t){const i=[];return[Math.max(1,e.lossRate-.5),Math.max(1,e.lossRate-1),Math.max(1,e.lossRate-1.5)].forEach(s=>{if(s>=e.lossRate)return;const n={...e,lossRate:s},o=this.simulateWithParams(n);if(o&&o.tradingDays<t){const l=t-o.tradingDays,r=(l/t*100).toFixed(1);i.push({type:"lossRate",title:"降低亏损率",description:`亏损率从${e.lossRate}%降低到${s}%`,newValue:s,oldValue:e.lossRate,newDays:o.tradingDays,daysSaved:l,improvement:r,impact:l,priority:l>100?"high":l>50?"medium":"low"})}}),i}analyzePositionOptimization(e,t){const i=[];return[Math.min(50,e.position+10),Math.min(50,e.position+20)].forEach(s=>{if(s<=e.position)return;const n={...e,position:s},o=this.simulateWithParams(n);if(o&&o.tradingDays<t){const l=t-o.tradingDays,r=(l/t*100).toFixed(1);i.push({type:"position",title:"提升仓位",description:`仓位从${e.position}%提升到${s}%`,newValue:s,oldValue:e.position,newDays:o.tradingDays,daysSaved:l,improvement:r,impact:l,priority:l>100?"high":l>50?"medium":"low",warning:"提升仓位会增加风险，请谨慎考虑"})}}),i}async analyzeParameterImpact(e,t,i,a){const s={type:e,name:this.getParameterDisplayName(e),currentValue:this.getCurrentParameterValue(e,t),scenarios:[],maxImpact:0,averageImpact:0,feasibilityScore:0,overallScore:0},n=this.getTestScenarios(e,t,a);for(const l of n){const r={...t,...l.params},d=await this.simulateWithParams(r);if(d&&d.success){const c=i-d.tradingDays,p=c/i*100;s.scenarios.push({description:l.description,newValue:l.displayValue,newDays:d.tradingDays,daysSaved:Math.max(0,c),improvement:p/100,improvementPercent:p.toFixed(1),impact:Math.max(0,c),feasibility:l.feasibility||.5,difficulty:l.difficulty||"中等",params:l.params}),s.maxImpact=Math.max(s.maxImpact,Math.max(0,c))}}const o=s.scenarios.filter(l=>l.impact>0);return s.averageImpact=o.length>0?o.reduce((l,r)=>l+r.impact,0)/o.length:0,s.feasibilityScore=this.calculateFeasibilityScore(e,t,a),s.overallScore=s.maxImpact*s.feasibilityScore,s}calculateFeasibilityScore(e,t,i){switch(e){case"initialCapital":return this.calculateCapitalFeasibility(t,i);case"winRate":return this.calculateWinRateFeasibility(t,i);case"profitRate":return this.calculateProfitRateFeasibility(t,i);case"lossRate":return this.calculateLossRateFeasibility(t,i);case"position":return this.calculatePositionFeasibility(t,i);case"dailyTrades":return this.calculateDailyTradesFeasibility(t,i);default:return .5}}calculateCapitalFeasibility(e,t){const i=e.initialCapital;let a=0;return i<=5?a=.7:i<=20?a=.6:i<=100?a=.4:a=.3,a}calculateWinRateFeasibility(e,t){const i=e.winRate*100;let a=0;switch(i<50?a=.7:i<60?a=.6:i<70?a=.4:i<80?a=.2:a=.1,t.skillLevel){case"beginner":i<60&&(a*=1.2);break;case"intermediate":a*=1;break;case"advanced":a*=.8;break}return Math.max(.05,Math.min(.8,a))}calculateProfitRateFeasibility(e,t){const i=e.avgProfitRate*100;let a=0;switch(i<3?a=.8:i<5?a=.6:i<7?a=.4:i<10?a=.2:a=.1,t.skillLevel){case"beginner":i<5?a*=1.3:a*=.7;break;case"intermediate":a*=1;break;case"advanced":i<7?a*=1.1:a*=.6;break}return Math.max(.05,Math.min(.8,a))}calculateLossRateFeasibility(e,t){const i=e.avgLossRate*100;let a=0;switch(i>5?a=.8:i>3?a=.6:i>2?a=.4:i>1?a=.2:a=.1,t.skillLevel){case"beginner":i>3?a*=1.4:a*=.8;break;case"intermediate":a*=1;break;case"advanced":i>2?a*=1.1:a*=.7;break}return Math.max(.05,Math.min(.8,a))}calculatePositionFeasibility(e,t){const i=e.positionSize*100;let a=0;switch(i<20?a=.7:i<30?a=.5:i<40?a=.3:i<50?a=.2:a=.1,t.riskTolerance){case"low":a*=.6;break;case"medium":a*=1;break;case"high":a*=1.3;break}switch(t.skillLevel){case"beginner":a*=.7;break;case"intermediate":a*=1;break;case"advanced":a*=1.2;break}return Math.max(.05,Math.min(.8,a))}calculateDailyTradesFeasibility(e,t){const i=e.dailyTrades;let a=0;switch(i<2?a=.8:i<4?a=.6:i<6?a=.4:i<8?a=.2:a=.1,t.skillLevel){case"beginner":a*=.5;break;case"intermediate":a*=1;break;case"advanced":a*=1.4;break}switch(t.capitalLevel){case"low":a*=.8;break;case"medium":a*=1;break;case"high":a*=1.2;break}return Math.max(.05,Math.min(.8,a))}getCapitalScenarios(e,t,i=!1){const a=e.initialCapital,s=[];if(i)s.push({description:"增加50%",params:{initialCapital:a*1.5},displayValue:`${a*1.5}万元`,feasibility:this.userProfile.difficultyToFeasibility(this.userProfile.getDifficulty("initialCapital_50%")),difficulty:this.getDifficultyText(this.userProfile.getDifficulty("initialCapital_50%"))},{description:"翻倍",params:{initialCapital:a*2},displayValue:`${a*2}万元`,feasibility:this.userProfile.difficultyToFeasibility(this.userProfile.getDifficulty("initialCapital_100%")),difficulty:this.getDifficultyText(this.userProfile.getDifficulty("initialCapital_100%"))},{description:"增加3倍",params:{initialCapital:a*3},displayValue:`${a*3}万元`,feasibility:this.userProfile.difficultyToFeasibility(this.userProfile.getDifficulty("initialCapital_200%")),difficulty:this.getDifficultyText(this.userProfile.getDifficulty("initialCapital_200%"))});else switch(t.capitalLevel){case"low":s.push({description:"增加30%",params:{initialCapital:a*1.3},displayValue:`${a*1.3}万元`,feasibility:.8,difficulty:"容易"},{description:"增加50%",params:{initialCapital:a*1.5},displayValue:`${a*1.5}万元`,feasibility:.6,difficulty:"中等"},{description:"翻倍",params:{initialCapital:a*2},displayValue:`${a*2}万元`,feasibility:.4,difficulty:"较难"});break;case"medium":s.push({description:"增加50%",params:{initialCapital:a*1.5},displayValue:`${a*1.5}万元`,feasibility:.6,difficulty:"中等"},{description:"翻倍",params:{initialCapital:a*2},displayValue:`${a*2}万元`,feasibility:.4,difficulty:"较难"},{description:"增加3倍",params:{initialCapital:a*3},displayValue:`${a*3}万元`,feasibility:.2,difficulty:"困难"});break;case"high":s.push({description:"增加50%",params:{initialCapital:a*1.5},displayValue:`${a*1.5}万元`,feasibility:.4,difficulty:"较难"},{description:"翻倍",params:{initialCapital:a*2},displayValue:`${a*2}万元`,feasibility:.3,difficulty:"困难"},{description:"增加3倍",params:{initialCapital:a*3},displayValue:`${a*3}万元`,feasibility:.2,difficulty:"很困难"});break;case"very-high":s.push({description:"增加50%",params:{initialCapital:a*1.5},displayValue:`${a*1.5}万元`,feasibility:.3,difficulty:"困难"},{description:"翻倍",params:{initialCapital:a*2},displayValue:`${a*2}万元`,feasibility:.2,difficulty:"很困难"},{description:"增加3倍",params:{initialCapital:a*3},displayValue:`${a*3}万元`,feasibility:.1,difficulty:"极困难"});break}return s}async generateSmartCombinations(e,t,i,a){const s={conservative:null,moderate:null,aggressive:null};return s.conservative=await this.generateOptimalCombination("conservative",e,t,i,a),s.moderate=await this.generateOptimalCombination("moderate",e,t,i,a),s.aggressive=await this.generateOptimalCombination("aggressive",e,t,i,a),s}async generateOptimalCombination(e,t,i,a,s){try{const n=this.getStyleConfig(e),o=await this.generateMultiParameterCombination(t,i,n,s);return{style:e,styleConfig:n,combination:o,alternatives:[]}}catch(n){return console.error(`Error generating ${e} combination:`,n),{style:e,styleConfig:this.getStyleConfig(e),combination:null,alternatives:[]}}}async generateMultiParameterCombination(e,t,i,a){const s=i.strategy,n={...e},o=[];let l=0,r=0,d=0;for(const[y,u]of Object.entries(s.parameterWeights)){if(u===0)continue;const m=a.find(f=>f.type===y);if(!m)continue;const h=this.optimizeParameter(y,e,m,s,u,i.riskTolerance);h&&(n[y]=h.newValue,o.push({parameter:y,currentValue:h.currentValue,newValue:h.newValue,improvement:h.improvement,feasibility:h.feasibility,difficulty:h.difficulty,weight:u}),l+=h.improvement*u,r+=h.feasibility*u,d++)}if(d===0)return null;const c=await this.simulateWithParams(n),p=t-c.tradingDays,v=p/t*100;return{params:n,result:c,improvement:p,improvementPercentage:v,adjustments:o,totalImpact:l,averageFeasibility:r/d,adjustmentCount:d,difficulty:this.calculateOverallDifficulty(o),isValid:p>0&&c.tradingDays>0}}getStyleConfig(e){return{conservative:{name:"保守型",description:"稳健策略，优先控制风险，追求稳定收益",color:"#10b981",icon:"🛡️",strategy:{primaryGoals:["winRate","lossRate","initialCapital"],secondaryGoals:["profitRate"],avoidGoals:["position","dailyTrades"],parameterWeights:{winRate:.35,lossRate:.3,initialCapital:.25,profitRate:.1,position:0,dailyTrades:0},constraints:{maxWinRateIncrease:.1,maxLossRateDecrease:.015,maxCapitalIncrease:1,maxProfitRateIncrease:.015,maxPositionIncrease:0,maxTradesIncrease:0}},feasibilityThreshold:.6,maxDifficulty:["容易","中等"],riskTolerance:"low",maxParams:4,minFeasibility:.6},moderate:{name:"平衡型",description:"平衡风险收益，多参数适度优化",color:"#3b82f6",icon:"⚖️",strategy:{primaryGoals:["profitRate","winRate","initialCapital"],secondaryGoals:["position","lossRate"],avoidGoals:["dailyTrades"],parameterWeights:{profitRate:.25,winRate:.25,initialCapital:.2,position:.15,lossRate:.15,dailyTrades:0},constraints:{maxWinRateIncrease:.12,maxLossRateDecrease:.012,maxCapitalIncrease:1.5,maxProfitRateIncrease:.04,maxPositionIncrease:.2,maxTradesIncrease:2}},feasibilityThreshold:.4,maxDifficulty:["容易","中等","较难"],riskTolerance:"medium",maxParams:5,minFeasibility:.4},aggressive:{name:"激进型",description:"追求最快收益，多参数激进优化，可承受高风险",color:"#ef4444",icon:"🚀",strategy:{primaryGoals:["profitRate","position","dailyTrades","initialCapital"],secondaryGoals:["winRate"],avoidGoals:["lossRate"],parameterWeights:{profitRate:.4,position:.3,dailyTrades:.15,initialCapital:.1,winRate:.05,lossRate:0},constraints:{minWinRate:.5,maxWinRateDecrease:.1,maxCapitalIncrease:3,maxProfitRateIncrease:.08,maxPositionIncrease:.5,maxTradesIncrease:6,maxLossRateIncrease:.02}},feasibilityThreshold:.2,maxDifficulty:["容易","中等","较难","困难","极困难"],riskTolerance:"high",maxParams:6,minFeasibility:.2}}[e]}optimizeParameter(e,t,i,a,s,n="medium"){const o=a.constraints,r={position:"positionSize",profitRate:"avgProfitRate",lossRate:"avgLossRate"}[e]||e,d=t[r];let c=null,p=0;for(const y of i.scenarios){if(!this.isScenarioValid(e,y,d,o))continue;let u;switch(n){case"low":u=y.improvement*Math.pow(y.feasibility,2)*s;break;case"high":u=Math.pow(y.improvement,1.5)*Math.pow(y.feasibility,.5)*s;break;case"medium":default:u=y.improvement*y.feasibility*s;break}u>p&&(p=u,c=y)}if(!c)return null;const v=c.params[r]||c.params[e];return{currentValue:d,newValue:v,improvement:c.improvement,difficulty:c.difficulty,feasibility:c.feasibility}}isScenarioValid(e,t,i,a){const s=t.newValue;switch(e){case"winRate":const n=s-i;if(a.maxWinRateIncrease&&n>a.maxWinRateIncrease||a.maxWinRateDecrease&&n<-a.maxWinRateDecrease||a.minWinRate&&s<a.minWinRate)return!1;break;case"profitRate":const o=s-i;if(a.maxProfitRateIncrease&&o>a.maxProfitRateIncrease)return!1;break;case"lossRate":const l=i-s;if(a.maxLossRateDecrease&&l>a.maxLossRateDecrease||a.maxLossRateIncrease&&l<-a.maxLossRateIncrease)return!1;break;case"initialCapital":const r=s/i;if(a.maxCapitalIncrease&&r>1+a.maxCapitalIncrease)return!1;break;case"position":const d=s-i;if(a.maxPositionIncrease&&d>a.maxPositionIncrease)return!1;break;case"dailyTrades":const c=s-i;if(a.maxTradesIncrease&&c>a.maxTradesIncrease)return!1;break}return!0}calculateOverallDifficulty(e){if(e.length===0)return"容易";const t={容易:1,中等:2,较难:3,困难:4,极困难:5},a=e.reduce((s,n)=>s+(t[n.difficulty]||2)*n.weight,0)/e.reduce((s,n)=>s+n.weight,0);return a<=1.5?"容易":a<=2.5?"中等":a<=3.5?"较难":a<=4.5?"困难":"极困难"}getParameterOptionsForStyle(e,t,i){const a={};for(const s of t){a[s.type]=[];for(const n of s.scenarios){const o=n.feasibility>=i.feasibilityThreshold*.5,l=i.maxDifficulty.includes(n.difficulty);o&&l&&n.impact>0&&a[s.type].push({...n,paramType:s.type,currentValue:s.currentValue})}if(a[s.type].length===0&&s.scenarios.length>0){const n=s.scenarios.filter(o=>o.impact>0).sort((o,l)=>l.impact-o.impact).slice(0,2);for(const o of n)a[s.type].push({...o,paramType:s.type,currentValue:s.currentValue})}a[s.type].length===0&&a[s.type].push({description:"保持当前",params:{},displayValue:s.currentValue,feasibility:1,difficulty:"无需改变",impact:0,paramType:s.type,currentValue:s.currentValue})}return a}generateParameterCombinations(e,t){const i=[],a=Object.entries(e).filter(([s,n])=>n.length>0&&n.some(o=>o.impact>0)).map(([s,n])=>({paramType:s,options:n.filter(o=>o.impact>0)}));if(a.length===0)return i;for(const s of a)if(s.options.length>0){const n={},o=s.options.sort((l,r)=>r.feasibility-l.feasibility)[0];n[s.paramType]=o,i.push(n)}if(a.length>=2){const s=a.sort((o,l)=>{const r=Math.max(...o.options.map(c=>c.feasibility));return Math.max(...l.options.map(c=>c.feasibility))-r}).slice(0,2),n={};for(const o of s){const l=o.options.sort((r,d)=>d.feasibility-r.feasibility)[0];n[o.paramType]=l}i.push(n)}if(a.length>=3){const s=a.sort((o,l)=>{const r=Math.max(...o.options.map(c=>c.impact));return Math.max(...l.options.map(c=>c.impact))-r}).slice(0,3),n={};for(const o of s){const l=o.options.sort((r,d)=>d.impact-r.impact)[0];n[o.paramType]=l}i.push(n)}return i}async evaluateCombination(e,t,i,a){try{const s={...t},n=[];let o=1,l=0,r=0;for(const[u,m]of Object.entries(e))m&&m.params&&Object.keys(m.params).length>0&&(Object.assign(s,m.params),n.push({paramType:u,description:m.description,from:m.currentValue,to:m.newValue||m.displayValue,difficulty:m.difficulty||"中等",feasibility:m.feasibility||.5}),o*=m.feasibility||.5,l+=this.getDifficultyScore(m.difficulty||"中等"),r++);if(r===0)return{isValid:!1};if(!(r<=a.maxParameterChanges&&o>=a.feasibilityThreshold*.3))return{isValid:!1};const c=await this.simulateWithParams(s);if(!c||!c.success)return{isValid:!1};const p=Math.max(0,i-c.tradingDays),v=i>0?p/i*100:0,y=this.calculateCombinationScore(p,o,l/r,a);return{isValid:!0,params:s,changes:n,result:c,daysSaved:p,improvement:v,feasibility:o,difficulty:l/r,score:y,changeCount:r}}catch(s){return console.error("Error evaluating combination:",s),{isValid:!1}}}getDifficultyScore(e){return{容易:1,中等:2,较难:3,困难:4,很困难:5,极困难:6,无需改变:0}[e]||3}calculateCombinationScore(e,t,i,a){switch(a.optimizationGoal){case"stability":return e*.4+t*100*.6-i*5;case"balanced":return e*.6+t*100*.3-i*3;case"maximum":return e*.8+t*100*.2-i*1;default:return e*.5+t*100*.5-i*3}}selectOptimalCombination(e,t){return e.length===0?null:(e.sort((i,a)=>a.score-i.score),e[0])}getParameterDisplayName(e){return{initialCapital:"初始本金",winRate:"交易胜率",profitRate:"盈利率",lossRate:"亏损率",position:"交易仓位",dailyTrades:"交易次数"}[e]||e}getCurrentParameterValue(e,t){switch(e){case"initialCapital":return`${t.initialCapital}万元`;case"winRate":return`${(t.winRate*100).toFixed(0)}%`;case"profitRate":return`${(t.avgProfitRate*100).toFixed(1)}%`;case"lossRate":return`${(t.avgLossRate*100).toFixed(1)}%`;case"position":return`${(t.positionSize*100).toFixed(0)}%`;case"dailyTrades":return`${t.dailyTrades}次`;default:return""}}getTestScenarios(e,t,i){const a=this.userProfile.isCustom;switch(e){case"initialCapital":return this.getCapitalScenarios(t,i,a);case"winRate":const s=t.winRate*100,n=[];return s<50?n.push({description:"提升到55%",params:{winRate:.55},displayValue:"55%",feasibility:.7,difficulty:"容易"},{description:"提升到60%",params:{winRate:.6},displayValue:"60%",feasibility:.5,difficulty:"中等"},{description:"提升到65%",params:{winRate:.65},displayValue:"65%",feasibility:.3,difficulty:"较难"}):s<60?n.push({description:"提升到65%",params:{winRate:.65},displayValue:"65%",feasibility:.6,difficulty:"中等"},{description:"提升到70%",params:{winRate:.7},displayValue:"70%",feasibility:.4,difficulty:"较难"},{description:"提升到75%",params:{winRate:.75},displayValue:"75%",feasibility:.2,difficulty:"困难"}):s<70?n.push({description:"提升到70%",params:{winRate:.7},displayValue:"70%",feasibility:.5,difficulty:"较难"},{description:"提升到75%",params:{winRate:.75},displayValue:"75%",feasibility:.3,difficulty:"困难"},{description:"提升到80%",params:{winRate:.8},displayValue:"80%",feasibility:.1,difficulty:"极困难"}):n.push({description:"提升到75%",params:{winRate:.75},displayValue:"75%",feasibility:.3,difficulty:"困难"},{description:"提升到80%",params:{winRate:.8},displayValue:"80%",feasibility:.1,difficulty:"极困难"}),n.filter(u=>u.params.winRate>t.winRate);case"profitRate":const o=t.avgProfitRate*100,l=[];return o<3?l.push({description:"提升到4%",params:{avgProfitRate:.04},displayValue:"4.0%",feasibility:.8,difficulty:"容易"},{description:"提升到5%",params:{avgProfitRate:.05},displayValue:"5.0%",feasibility:.6,difficulty:"中等"},{description:"提升到6%",params:{avgProfitRate:.06},displayValue:"6.0%",feasibility:.4,difficulty:"较难"}):o<5?l.push({description:"提升到6%",params:{avgProfitRate:.06},displayValue:"6.0%",feasibility:.6,difficulty:"中等"},{description:"提升到7%",params:{avgProfitRate:.07},displayValue:"7.0%",feasibility:.4,difficulty:"较难"},{description:"提升到8%",params:{avgProfitRate:.08},displayValue:"8.0%",feasibility:.2,difficulty:"困难"}):o<7?l.push({description:"提升到8%",params:{avgProfitRate:.08},displayValue:"8.0%",feasibility:.4,difficulty:"较难"},{description:"提升到9%",params:{avgProfitRate:.09},displayValue:"9.0%",feasibility:.2,difficulty:"困难"},{description:"提升到10%",params:{avgProfitRate:.1},displayValue:"10.0%",feasibility:.1,difficulty:"极困难"}):l.push({description:"提升到9%",params:{avgProfitRate:.09},displayValue:"9.0%",feasibility:.2,difficulty:"困难"},{description:"提升到10%",params:{avgProfitRate:.1},displayValue:"10.0%",feasibility:.1,difficulty:"极困难"}),l.filter(u=>u.params.avgProfitRate>t.avgProfitRate);case"lossRate":const r=t.avgLossRate*100,d=[];return r>5?d.push({description:"降低到4%",params:{avgLossRate:.04},displayValue:"4.0%",feasibility:.8,difficulty:"容易"},{description:"降低到3%",params:{avgLossRate:.03},displayValue:"3.0%",feasibility:.6,difficulty:"中等"},{description:"降低到2%",params:{avgLossRate:.02},displayValue:"2.0%",feasibility:.4,difficulty:"较难"}):r>3?d.push({description:"降低到2.5%",params:{avgLossRate:.025},displayValue:"2.5%",feasibility:.6,difficulty:"中等"},{description:"降低到2%",params:{avgLossRate:.02},displayValue:"2.0%",feasibility:.4,difficulty:"较难"},{description:"降低到1.5%",params:{avgLossRate:.015},displayValue:"1.5%",feasibility:.2,difficulty:"困难"}):r>2?d.push({description:"降低到1.5%",params:{avgLossRate:.015},displayValue:"1.5%",feasibility:.4,difficulty:"较难"},{description:"降低到1%",params:{avgLossRate:.01},displayValue:"1.0%",feasibility:.2,difficulty:"困难"}):d.push({description:"降低到1%",params:{avgLossRate:.01},displayValue:"1.0%",feasibility:.2,difficulty:"困难"},{description:"降低到0.5%",params:{avgLossRate:.005},displayValue:"0.5%",feasibility:.1,difficulty:"极困难"}),d.filter(u=>u.params.avgLossRate<t.avgLossRate);case"position":const c=t.positionSize*100,p=[];return c<20?p.push({description:"提升到25%",params:{positionSize:.25},displayValue:"25%",feasibility:.7,difficulty:"容易"},{description:"提升到30%",params:{positionSize:.3},displayValue:"30%",feasibility:.5,difficulty:"中等"},{description:"提升到35%",params:{positionSize:.35},displayValue:"35%",feasibility:.3,difficulty:"较难"}):c<30?p.push({description:"提升到35%",params:{positionSize:.35},displayValue:"35%",feasibility:.5,difficulty:"中等"},{description:"提升到40%",params:{positionSize:.4},displayValue:"40%",feasibility:.3,difficulty:"较难"},{description:"提升到50%",params:{positionSize:.5},displayValue:"50%",feasibility:.2,difficulty:"困难"}):c<40?p.push({description:"提升到45%",params:{positionSize:.45},displayValue:"45%",feasibility:.3,difficulty:"较难"},{description:"提升到50%",params:{positionSize:.5},displayValue:"50%",feasibility:.2,difficulty:"困难"}):p.push({description:"提升到50%",params:{positionSize:.5},displayValue:"50%",feasibility:.1,difficulty:"极困难"}),p.filter(u=>u.params.positionSize>t.positionSize);case"dailyTrades":const v=t.dailyTrades,y=[];return v<2?y.push({description:"提升到3次",params:{dailyTrades:3},displayValue:"3次",feasibility:.8,difficulty:"容易"},{description:"提升到4次",params:{dailyTrades:4},displayValue:"4次",feasibility:.6,difficulty:"中等"},{description:"提升到5次",params:{dailyTrades:5},displayValue:"5次",feasibility:.4,difficulty:"较难"}):v<4?y.push({description:"提升到5次",params:{dailyTrades:5},displayValue:"5次",feasibility:.6,difficulty:"中等"},{description:"提升到6次",params:{dailyTrades:6},displayValue:"6次",feasibility:.4,difficulty:"较难"},{description:"提升到8次",params:{dailyTrades:8},displayValue:"8次",feasibility:.2,difficulty:"困难"}):v<6?y.push({description:"提升到8次",params:{dailyTrades:8},displayValue:"8次",feasibility:.4,difficulty:"较难"},{description:"提升到10次",params:{dailyTrades:10},displayValue:"10次",feasibility:.2,difficulty:"困难"}):y.push({description:"提升到10次",params:{dailyTrades:10},displayValue:"10次",feasibility:.2,difficulty:"困难"},{description:"提升到12次",params:{dailyTrades:12},displayValue:"12次",feasibility:.1,difficulty:"极困难"}),y.filter(u=>u.params.dailyTrades>t.dailyTrades);default:return[]}}async simulateWithParams(e){try{return await this.simulateTrading(e)}catch(t){return console.warn("模拟计算失败:",t),null}}displayOptimizationSuggestions(e){const t=document.getElementById("suggestionArea");if(!e||e.length===0){t.innerHTML=`
        <div class="suggestion-placeholder">
          <p>当前参数已经相对优化，暂无明显改进建议</p>
        </div>
      `;return}const i=e.map((a,s)=>{const n=a.priority==="high"?"high-priority":a.priority==="medium"?"medium-priority":"low-priority",o=Math.round(a.newDays/21),l=Math.floor(o/12),r=o%12,d=Math.round(a.newDays%21*(30/21));let c="";return l>0&&(c+=l+"年"),r>0&&(c+=r+"个月"),d>0&&(c+=d+"天"),c===""&&(c="0天"),`
        <div class="suggestion-card ${n}">
          <div class="suggestion-header">
            <div class="suggestion-rank">#${s+1}</div>
            <div class="suggestion-title">${a.title}</div>
            <div class="suggestion-impact">节省${a.daysSaved}天</div>
          </div>
          <div class="suggestion-content">
            <div class="suggestion-description">${a.description}</div>
            <div class="suggestion-result">
              <div class="result-comparison">
                <div class="before-after">
                  <span class="before">当前：${a.newDays+a.daysSaved}天</span>
                  <span class="arrow">→</span>
                  <span class="after">优化后：${a.newDays}天 (${c})</span>
                </div>
                <div class="improvement">提升效果：${a.improvementPercent}%</div>
              </div>
            </div>
            ${a.warning?`<div class="suggestion-warning">⚠️ ${a.warning}</div>`:""}
          </div>
        </div>
      `}).join("");t.innerHTML=`
      <div class="suggestions-container">
        <div class="suggestions-header">
          <h3>🎯 优化建议</h3>
          <p>以下建议按缩短天数的效果排序，建议优先考虑影响最大的优化方案</p>
        </div>
        <div class="suggestions-list">
          ${i}
        </div>
      </div>
    `}displayParameterImpactAnalysis(e,t){const i=document.getElementById("suggestionArea");if(!e||e.length===0){i.innerHTML=`
        <div class="suggestion-placeholder">
          <p>参数影响分析中，请稍候...</p>
        </div>
      `;return}const a=e.map((n,o)=>{const l=n.scenarios.some(c=>c.impact>0),r=n.scenarios.reduce((c,p)=>p.impact>c.impact?p:c,{impact:0}),d=n.scenarios.filter(c=>c.impact>0).map(c=>{const p=Math.round(c.newDays/21),v=Math.floor(p/12),y=p%12,u=Math.round(c.newDays%21*(30/21));let m="";return v>0&&(m+=v+"年"),y>0&&(m+=y+"个月"),u>0&&(m+=u+"天"),m===""&&(m="0天"),`
            <div class="scenario-item">
              <div class="scenario-header">
                <span class="scenario-description">${c.description}</span>
                <div class="scenario-metrics">
                  <span class="scenario-impact">节省${c.daysSaved}天</span>
                  ${c.difficulty?`<span class="scenario-difficulty difficulty-${c.difficulty}">${c.difficulty}</span>`:""}
                </div>
              </div>
              <div class="scenario-details">
                <div class="scenario-change">${n.currentValue} → ${c.newValue}</div>
                <div class="scenario-result">
                  <span class="result-days">优化后：${c.newDays}天 (${m})</span>
                  <span class="result-improvement">提升效果：${c.improvementPercent}%</span>
                </div>
              </div>
            </div>
          `}).join("");return`
        <div class="parameter-card ${l?"":"no-impact"}" data-parameter="${n.type}">
          <div class="parameter-header">
            <div class="parameter-rank">#${o+1}</div>
            <div class="parameter-info">
              <div class="parameter-name">${n.name}</div>
              <div class="parameter-current">当前：${n.currentValue}</div>
            </div>
            <div class="parameter-impact">
              ${l?`<div class="impact-info">
                  <span class="max-impact">最大影响：${r.daysSaved}天</span>
                  <span class="feasibility-score">可行性：${(n.feasibilityScore*100).toFixed(0)}%</span>
                  <span class="overall-score">综合评分：${n.overallScore.toFixed(0)}</span>
                </div>`:'<span class="no-impact-text">无明显影响</span>'}
            </div>
            <div class="expand-icon">▼</div>
          </div>
          <div class="parameter-scenarios">
            ${l?d:'<div class="no-scenarios">该参数在当前条件下优化空间有限</div>'}
          </div>
        </div>
      `}).join(""),s=this.generateUserProfileHtml(t);i.innerHTML=`
      <div class="parameter-analysis-container">
        <div class="analysis-header">
          <h3>📊 智能参数优化分析</h3>
          <p>基于您的投资画像，按综合评分排序（影响程度 × 可实现性）</p>
          ${s}
        </div>
        <div class="parameters-list">
          ${a}
        </div>
      </div>
    `,this.bindParameterCardEvents()}toggleParameterCard(e){e.classList.toggle("expanded")}bindParameterCardEvents(){document.querySelectorAll(".parameter-card").forEach(i=>{const a=i.querySelector(".parameter-header");a&&(i.classList.remove("expanded"),a.onclick=()=>{i.classList.toggle("expanded")})}),document.querySelectorAll(".suggestion-item.personalized").forEach(i=>{const a=i.querySelector(".suggestion-header");a&&(i.classList.remove("expanded"),a.onclick=()=>{i.classList.toggle("expanded")})})}displaySmartCombinations(e,t){const i=document.getElementById("combinationArea"),a=`
      <div class="smart-combinations-container">
        <div class="combinations-header">
          <h3>🎯 智能组合推荐</h3>
          <p>基于您的投资画像，为您推荐三种风格的最优参数组合</p>
        </div>
        <div class="combinations-grid">
          ${this.generateCombinationCard("conservative",e.conservative)}
          ${this.generateCombinationCard("moderate",e.moderate)}
          ${this.generateCombinationCard("aggressive",e.aggressive)}
        </div>
      </div>
    `;i.innerHTML=a,this.addCombinationEventListeners(e)}formatDetailedTime(e){const t=Math.round(e/21),i=Math.floor(t/12),a=t%12,s=Math.round(e%21*(30/21));let n="";return i>0&&(n+=i+"年"),a>0&&(n+=a+"个月"),s>0&&(n+=s+"天"),n===""&&(n="0天"),n}generateCombinationCard(e,t){if(!t||!t.combination||!t.combination.isValid)return`
        <div class="combination-card ${e}">
          <div class="combination-header">
            <div class="combination-icon">${t?.styleConfig?.icon||"❓"}</div>
            <div class="combination-title">
              <h4>${t?.styleConfig?.name||"未知"}</h4>
              <p>暂无推荐方案</p>
            </div>
          </div>
        </div>
      `;const i=t.styleConfig,a=t.combination,s=this.formatDetailedTime(a.result.tradingDays);return`
      <div class="combination-card ${e}" data-style="${e}">
        <div class="combination-header">
          <div class="combination-icon" style="background: ${i.color}20; color: ${i.color}">
            ${i.icon}
          </div>
          <div class="combination-title">
            <h4 style="color: ${i.color}">${i.name}</h4>
            <p class="combination-description">${i.description}</p>
          </div>
        </div>

        <div class="combination-results">
          <div class="result-highlight">
            <div class="result-main">
              <span class="result-days">节省 ${a.improvement} 天</span>
              <span class="result-improvement">提升 ${a.improvementPercentage.toFixed(1)}%</span>
            </div>
            <div class="result-detail">
              优化后：${a.result.tradingDays}天 (${s})
            </div>
          </div>

          <div class="combination-metrics">
            <div class="metric">
              <span class="metric-label">可行性</span>
              <span class="metric-value">${(a.averageFeasibility*100).toFixed(0)}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">难度</span>
              <span class="metric-value">${a.difficulty}</span>
            </div>
            <div class="metric">
              <span class="metric-label">参数调整</span>
              <span class="metric-value">${a.adjustmentCount}项</span>
            </div>
          </div>
        </div>

        <div class="combination-changes">
          <h5>主要调整：</h5>
          <div class="changes-list">
            ${a.adjustments.slice(0,3).map(n=>`
              <div class="change-item">
                <span class="change-param">${this.getParameterDisplayName(n.parameter)}</span>
                <span class="change-arrow">→</span>
                <span class="change-value">${this.formatParameterValue(n.parameter,n.newValue)}</span>
                <span class="change-difficulty difficulty-${n.difficulty}">${n.difficulty}</span>
              </div>
            `).join("")}
            ${a.adjustments.length>3?`<div class="more-changes">+${a.adjustments.length-3}项更多调整</div>`:""}
          </div>
        </div>

        <div class="combination-actions">
          <button class="btn-apply" data-style="${e}">
            应用此方案
          </button>
          <button class="btn-details" data-style="${e}">
            查看详情
          </button>
        </div>
      </div>
    `}getDifficultyLabel(e){return e<=1.5?"容易":e<=2.5?"中等":e<=3.5?"较难":e<=4.5?"困难":"很困难"}formatParameterValue(e,t){if(t==null||isNaN(t))return"未知";switch(e){case"initialCapital":return`${t}万元`;case"winRate":return`${(t*100).toFixed(1)}%`;case"profitRate":return`${(t*100).toFixed(1)}%`;case"lossRate":return`${(t*100).toFixed(1)}%`;case"position":return`${(t*100).toFixed(1)}%`;case"dailyTrades":return`${t}次`;default:return t.toString()}}formatImprovementValue(e){return e==null||isNaN(e)?"未知":typeof e=="string"?`${e}%`:`${(e*100).toFixed(1)}%`}formatFeasibilityValue(e){return e==null||isNaN(e)?"未知":`${(e*100).toFixed(0)}%`}addCombinationEventListeners(e){document.querySelectorAll(".btn-apply").forEach(t=>{t.addEventListener("click",i=>{const a=i.target.dataset.style;this.applyCombination(e[a])})}),document.querySelectorAll(".btn-details").forEach(t=>{t.addEventListener("click",i=>{const a=i.target.dataset.style;this.showCombinationDetails(e[a])})})}applyCombination(e){if(!e||!e.combination)return;const t=e.combination.params;t.initialCapital!==void 0&&(document.getElementById("initialCapital").value=t.initialCapital),t.winRate!==void 0&&(document.getElementById("winRate").value=(t.winRate*100).toFixed(0)),t.avgProfitRate!==void 0&&(document.getElementById("avgProfitRate").value=(t.avgProfitRate*100).toFixed(1)),t.avgLossRate!==void 0&&(document.getElementById("avgLossRate").value=(t.avgLossRate*100).toFixed(1)),t.positionSize!==void 0&&(document.getElementById("positionSize").value=(t.positionSize*100).toFixed(0)),this.showNotification(`已应用${e.styleConfig.name}方案`,"success"),setTimeout(()=>{this.calculate()},500)}showCombinationDetails(e){if(!e||!e.combination)return;const t=e.combination,i=e.styleConfig,a=`
      <div class="combination-details-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${i.icon} ${i.name}方案详情</h3>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="details-section">
              <h4>优化效果</h4>
              <div class="effect-details">
                <div class="effect-item">
                  <span class="effect-label">节省时间：</span>
                  <span class="effect-value">${t.improvement}天</span>
                </div>
                <div class="effect-item">
                  <span class="effect-label">提升幅度：</span>
                  <span class="effect-value">${t.improvementPercentage.toFixed(1)}%</span>
                </div>
                <div class="effect-item">
                  <span class="effect-label">优化后时间：</span>
                  <span class="effect-value">${this.formatDetailedTime(t.result.tradingDays)}</span>
                </div>
              </div>
            </div>

            <div class="details-section">
              <h4>参数调整详情</h4>
              <div class="changes-details">
                ${t.adjustments.map(s=>`
                  <div class="change-detail-item">
                    <div class="change-detail-header">
                      <span class="change-param-name">${this.getParameterDisplayName(s.parameter)}</span>
                      <span class="change-difficulty-badge difficulty-${s.difficulty}">${s.difficulty}</span>
                    </div>
                    <div class="change-detail-content">
                      <span class="change-from">${this.formatParameterValue(s.parameter,s.currentValue)}</span>
                      <span class="change-arrow">→</span>
                      <span class="change-to">${this.formatParameterValue(s.parameter,s.newValue)}</span>
                    </div>
                    <div class="change-description">
                      提升效果：${this.formatImprovementValue(s.improvement)}，可行性：${this.formatFeasibilityValue(s.feasibility)}
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>

            <div class="details-section">
              <h4>风险评估</h4>
              <div class="risk-assessment">
                <div class="risk-item">
                  <span class="risk-label">整体可行性：</span>
                  <span class="risk-value">${(t.averageFeasibility*100).toFixed(1)}%</span>
                </div>
                <div class="risk-item">
                  <span class="risk-label">平均难度：</span>
                  <span class="risk-value">${t.difficulty}</span>
                </div>
                <div class="risk-item">
                  <span class="risk-label">参数调整：</span>
                  <span class="risk-value">${t.adjustmentCount}项</span>
                </div>
                <div class="risk-item">
                  <span class="risk-label">总体影响：</span>
                  <span class="risk-value">${(t.totalImpact*100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-apply-modal" data-combination='${JSON.stringify(e)}'>
              应用此方案
            </button>
            <button class="btn-cancel-modal">
              取消
            </button>
          </div>
        </div>
      </div>
    `;document.body.insertAdjacentHTML("beforeend",a),this.addModalEventListeners()}addModalEventListeners(){const e=document.querySelector(".combination-details-modal");e.querySelector(".modal-close").addEventListener("click",()=>{e.remove()}),e.querySelector(".btn-cancel-modal").addEventListener("click",()=>{e.remove()}),e.querySelector(".btn-apply-modal").addEventListener("click",t=>{const i=JSON.parse(t.target.dataset.combination);this.applyCombination(i),e.remove()}),e.addEventListener("click",t=>{t.target===e&&e.remove()})}showNotification(e,t="info"){const i=document.createElement("div");i.className=`notification ${t}`,i.textContent=e,document.body.appendChild(i),setTimeout(()=>{i.classList.add("show")},100),setTimeout(()=>{i.classList.remove("show"),setTimeout(()=>{i.remove()},300)},3e3)}generateUserProfileHtml(e){const t={conservative:"保守型 - 重点关注容易实现的优化",aggressive:"激进型 - 可以尝试各种优化方案","capital-focused":"资金导向 - 优先考虑资金类优化","skill-focused":"技能导向 - 优先考虑技能类优化",balanced:"平衡型 - 综合考虑各类优化"},i={low:"小资金",medium:"中等资金",high:"较大资金","very-high":"大资金"},a={beginner:"初级",intermediate:"中级",advanced:"高级"};return`
      <div class="user-profile">
        <div class="profile-item">
          <span class="profile-label">投资画像：</span>
          <span class="profile-value">${t[e.optimizationMode]}</span>
        </div>
        <div class="profile-details">
          <span class="profile-detail">资金水平：${i[e.capitalLevel]}</span>
          <span class="profile-detail">交易技能：${a[e.skillLevel]}</span>
        </div>
      </div>
    `}toggleChartType(){const t=document.getElementById("chartTypeToggle").querySelector(".chart-type-text");t.textContent==="年度视图"?(t.textContent="月度视图",this.currentChartType="monthly"):(t.textContent="年度视图",this.currentChartType="yearly");const a=this.lastSalaryResult;a&&this.generateSalaryWealthChart(a)}refreshOptimizationSuggestions(){console.log("刷新优化建议功能已移至主应用类")}bindJobWorthEvents(e){const t={CN:4.19,US:1,JP:102.84,KR:870,SG:1.35,HK:6.07,TW:28.5,GB:.7,DE:.75,FR:.73,AU:1.47,CA:1.21,IN:21.99,TH:10.5,MY:1.7},i={CN:"¥",US:"$",JP:"¥",KR:"₩",SG:"S$",HK:"HK$",TW:"NT$",GB:"£",DE:"€",FR:"€",AU:"A$",CA:"C$",IN:"₹",TH:"฿",MY:"RM"},a=()=>{const o={salary:parseFloat(e.querySelector("#jobSalary")?.value)||0,country:e.querySelector("#jobCountry")?.value||"CN",workDaysPerWeek:parseFloat(e.querySelector("#workDaysPerWeek")?.value)||5,workHoursPerDay:parseFloat(e.querySelector("#workHoursPerDay")?.value)||8,commuteHours:parseFloat(e.querySelector("#commuteHours")?.value)||1,wfhDays:parseFloat(e.querySelector("#wfhDays")?.value)||0,annualLeave:parseFloat(e.querySelector("#annualLeave")?.value)||5,publicHolidays:parseFloat(e.querySelector("#publicHolidays")?.value)||11,cityLevel:parseFloat(e.querySelector("#cityLevel")?.value)||1,workEnvironment:parseFloat(e.querySelector("#workEnvironment")?.value)||1,teamwork:parseFloat(e.querySelector("#teamwork")?.value)||1,education:parseFloat(e.querySelector("#education")?.value)||1,workYears:parseFloat(e.querySelector("#workYears")?.value)||0,jobType:e.querySelector("#jobType")?.value||"private",hometown:e.querySelector("#hometown")?.value||"no",leadership:parseFloat(e.querySelector("#leadership")?.value)||1,shuttleBus:parseFloat(e.querySelector("#shuttleBus")?.value)||1,cafeteria:parseFloat(e.querySelector("#cafeteria")?.value)||1,hasShuttle:e.querySelector("#hasShuttle")?.checked||!1,hasCanteen:e.querySelector("#hasCanteen")?.checked||!1,restTime:parseFloat(e.querySelector("#restTime")?.value)||0,paidSickLeave:parseFloat(e.querySelector("#paidSickLeave")?.value)||0};if(!o.salary){this.displayJobWorthResult(e,0,"请输入年薪",{});return}const l=this.computeJobWorth(o,t,i);this.displayJobWorthResult(e,l.score,l.rating,l.details)},s=e.querySelector("#calculateJobWorth");s&&s.addEventListener("click",a),e.querySelectorAll("input, select").forEach(o=>{o.addEventListener("input",a),o.addEventListener("change",a)})}loadJobWorthCalculator(e){e.innerHTML=`
      <div class="job-worth-form">
        <!-- 基础薪资信息 -->
        <div class="form-section">
          <h3>💰 薪资信息</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="jobSalary">年薪</label>
              <input type="number" id="jobSalary" placeholder="请输入年薪">
            </div>
            <div class="form-group">
              <label for="jobCountry">工作国家/地区</label>
              <select id="jobCountry">
                <option value="CN">中国 (PPP: 4.19)</option>
                <option value="US">美国 (PPP: 1.00)</option>
                <option value="JP">日本 (PPP: 102.84)</option>
                <option value="KR">韩国 (PPP: 870.00)</option>
                <option value="SG">新加坡 (PPP: 1.35)</option>
                <option value="HK">香港 (PPP: 6.07)</option>
                <option value="TW">台湾 (PPP: 28.50)</option>
                <option value="GB">英国 (PPP: 0.70)</option>
                <option value="DE">德国 (PPP: 0.75)</option>
                <option value="FR">法国 (PPP: 0.73)</option>
                <option value="AU">澳大利亚 (PPP: 1.47)</option>
                <option value="CA">加拿大 (PPP: 1.21)</option>
                <option value="IN">印度 (PPP: 21.99)</option>
                <option value="TH">泰国 (PPP: 10.50)</option>
                <option value="MY">马来西亚 (PPP: 1.70)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 工作时间 -->
        <div class="form-section">
          <h3>⏰ 工作时间</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="workDaysPerWeek">每周工作天数</label>
              <input type="number" id="workDaysPerWeek" value="5" min="1" max="7">
            </div>
            <div class="form-group">
              <label for="workHoursPerDay">每日工作小时</label>
              <input type="number" id="workHoursPerDay" value="8" min="1" max="24" step="0.5">
            </div>
            <div class="form-group">
              <label for="commuteHours">每日通勤小时</label>
              <input type="number" id="commuteHours" value="1" min="0" max="8" step="0.5">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="wfhDays">每周远程天数</label>
              <input type="number" id="wfhDays" value="0" min="0" max="7">
            </div>
            <div class="form-group">
              <label for="annualLeave">年假天数</label>
              <input type="number" id="annualLeave" value="5" min="0" max="30">
            </div>
            <div class="form-group">
              <label for="publicHolidays">法定假期天数</label>
              <input type="number" id="publicHolidays" value="11" min="0" max="30">
            </div>
          </div>
        </div>

        <!-- 工作环境 -->
        <div class="form-section">
          <h3>🏢 工作环境</h3>

          <!-- 地理位置 -->
          <div class="environment-subsection">
            <h4>📍 地理位置</h4>
            <div class="form-row">
              <div class="form-group">
                <label for="cityLevel">城市等级</label>
                <select id="cityLevel">
                  <option value="0.70">一线城市</option>
                  <option value="0.80">新一线城市</option>
                  <option value="1.0" selected>二线城市</option>
                  <option value="1.10">三线城市</option>
                  <option value="1.25">四线城市</option>
                  <option value="1.40">县城</option>
                  <option value="1.50">乡镇</option>
                </select>
              </div>
              <div class="form-group">
                <label for="hometown">是否在家乡工作</label>
                <select id="hometown">
                  <option value="no" selected>不在家乡</option>
                  <option value="yes">在家乡</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 工作环境 -->
          <div class="environment-subsection">
            <h4>🏭 工作环境</h4>
            <div class="form-group">
              <label for="workEnvironment">工作环境类型</label>
              <select id="workEnvironment">
                <option value="0.8">偏僻的工厂/工地/户外</option>
                <option value="0.9">工厂/工地/户外</option>
                <option value="1.0" selected>普通环境</option>
                <option value="1.1">CBD</option>
              </select>
            </div>
          </div>

          <!-- 人际关系 -->
          <div class="environment-subsection">
            <h4>👥 人际关系</h4>
            <div class="form-row">
              <div class="form-group">
                <label for="leadership">领导/老板</label>
                <select id="leadership">
                  <option value="0.7">对我不爽</option>
                  <option value="0.9">管理严格</option>
                  <option value="1.0" selected>中规中矩</option>
                  <option value="1.1">普通人缘</option>
                  <option value="1.3">我是爆亲</option>
                </select>
              </div>
              <div class="form-group">
                <label for="teamwork">同事环境</label>
                <select id="teamwork">
                  <option value="0.9">都是傻逼</option>
                  <option value="1.0" selected>冲水柜道</option>
                  <option value="1.1">和谐融洽</option>
                  <option value="1.2">私交甚好</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- 福利待遇 -->
        <div class="form-section">
          <h3>🎁 福利待遇</h3>

          <!-- 班车服务 -->
          <div class="welfare-subsection">
            <h4>🚌 班车服务</h4>
            <div class="form-group">
              <label for="shuttleBus">班车便利度</label>
              <select id="shuttleBus">
                <option value="0.8">无法抵达</option>
                <option value="0.9">班车不便</option>
                <option value="1.0" selected>便利班车</option>
                <option value="1.1">班车直达</option>
              </select>
            </div>
          </div>

          <!-- 食堂情况 -->
          <div class="welfare-subsection">
            <h4>🍽️ 食堂情况</h4>
            <div class="form-group">
              <label for="cafeteria">食堂质量</label>
              <select id="cafeteria">
                <option value="0.8">无法抵达</option>
                <option value="0.9">冲水柜道</option>
                <option value="1.0" selected>和谐融洽</option>
                <option value="1.1">私交甚好</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 个人背景 -->
        <div class="form-section">
          <h3>🎓 个人背景</h3>

          <!-- 学历系统优化 -->
          <div class="education-section">
            <h4>📚 学历背景</h4>
            <div class="form-row">
              <div class="form-group">
                <label for="degreeType">学位类型</label>
                <select id="degreeType">
                  <option value="belowBachelor">专科及以下</option>
                  <option value="bachelor" selected>本科</option>
                  <option value="masters">硕士</option>
                  <option value="phd">博士</option>
                </select>
              </div>
              <div class="form-group">
                <label for="schoolType">学校类型</label>
                <select id="schoolType">
                  <option value="secondTier">二本三本</option>
                  <option value="firstTier" selected>双非/QS200/USnews80</option>
                  <option value="elite">985211/QS50/USnews30</option>
                </select>
              </div>
            </div>
            <!-- 硕士本科背景选择 -->
            <div class="form-group bachelor-background" style="display: none;">
              <label for="bachelorType">本科背景</label>
              <select id="bachelorType">
                <option value="secondTier">二本三本</option>
                <option value="firstTier" selected>双非/QS200/USnews80</option>
                <option value="elite">985211/QS50/USnews30</option>
              </select>
            </div>
            <!-- 隐藏的教育系数字段，用于兼容现有计算逻辑 -->
            <input type="hidden" id="education" value="1.0">
          </div>

          <!-- 工作经历 -->
          <div class="form-row">
            <div class="form-group">
              <label for="workYears">工作年限</label>
              <select id="workYears">
                <option value="0" selected>应届生</option>
                <option value="1">1-3年</option>
                <option value="3">3-5年</option>
                <option value="5">5-8年</option>
                <option value="8">8-10年</option>
                <option value="10">10-12年</option>
                <option value="12">12年以上</option>
              </select>
            </div>
            <div class="form-group">
              <label for="jobType">职业稳定度</label>
              <select id="jobType">
                <option value="government">政府/事业单位</option>
                <option value="state">国企/大型企业</option>
                <option value="foreign">外企/守法企业</option>
                <option value="private" selected>私企/领件工厂</option>
                <option value="dispatch">劳务派遣/OD</option>
                <option value="freelance">自由职业</option>
              </select>
            </div>
          </div>
        </div>

        <div class="calculate-button-container">
          <button id="calculateJobWorth" class="calculate-btn">
            计算工作价值
          </button>
        </div>
      </div>

      <!-- 结果显示区域 -->
      <div id="jobWorthResult" class="job-worth-result" style="display: none;">
        <div class="result-header">
          <h3>📊 工作价值评估结果</h3>
        </div>
        <div class="result-content">
          <div class="result-score">
            <div class="score-value" id="jobWorthScore">0.00</div>
            <div class="score-label" id="jobWorthRating">请输入信息</div>
          </div>
          <div class="result-details">
            <div class="detail-item">
              <span class="detail-label">标准化日薪：</span>
              <span class="detail-value" id="dailySalaryDisplay">¥0</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">年工作天数：</span>
              <span class="detail-value" id="workDaysDisplay">0天</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">每日总时间投入：</span>
              <span class="detail-value" id="totalTimeDisplay">0小时</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">环境调整系数：</span>
              <span class="detail-value" id="environmentFactorDisplay">1.00</span>
            </div>
          </div>
        </div>
      </div>
    `,this.bindJobWorthCalculatorEvents(e)}bindJobWorthCalculatorEvents(e){const t={CN:4.19,US:1,JP:102.84,KR:870,SG:1.35,HK:6.07,TW:28.5,GB:.7,DE:.75,FR:.73,AU:1.47,CA:1.21,IN:21.99,TH:10.5,MY:1.7},i={CN:"¥",US:"$",JP:"¥",KR:"₩",SG:"S$",HK:"HK$",TW:"NT$",GB:"£",DE:"€",FR:"€",AU:"A$",CA:"C$",IN:"₹",TH:"฿",MY:"RM"},a=()=>{const o={salary:parseFloat(e.querySelector("#jobSalary")?.value)||0,country:e.querySelector("#jobCountry")?.value||"CN",workDaysPerWeek:parseFloat(e.querySelector("#workDaysPerWeek")?.value)||5,workHoursPerDay:parseFloat(e.querySelector("#workHoursPerDay")?.value)||8,commuteHours:parseFloat(e.querySelector("#commuteHours")?.value)||1,wfhDays:parseFloat(e.querySelector("#wfhDays")?.value)||0,annualLeave:parseFloat(e.querySelector("#annualLeave")?.value)||5,publicHolidays:parseFloat(e.querySelector("#publicHolidays")?.value)||11,cityLevel:parseFloat(e.querySelector("#cityLevel")?.value)||1,workEnvironment:parseFloat(e.querySelector("#workEnvironment")?.value)||1,teamwork:parseFloat(e.querySelector("#teamwork")?.value)||1,education:parseFloat(e.querySelector("#education")?.value)||1,workYears:parseFloat(e.querySelector("#workYears")?.value)||0,jobType:e.querySelector("#jobType")?.value||"private",hometown:e.querySelector("#hometown")?.value||"no",leadership:parseFloat(e.querySelector("#leadership")?.value)||1,shuttleBus:parseFloat(e.querySelector("#shuttleBus")?.value)||1,cafeteria:parseFloat(e.querySelector("#cafeteria")?.value)||1,hasShuttle:e.querySelector("#hasShuttle")?.checked||!1,hasCanteen:e.querySelector("#hasCanteen")?.checked||!1,restTime:parseFloat(e.querySelector("#restTime")?.value)||0,paidSickLeave:parseFloat(e.querySelector("#paidSickLeave")?.value)||0};if(!o.salary){this.displayJobWorthResult(e,0,"请输入年薪",{});return}const l=this.computeJobWorth(o,t,i);this.displayJobWorthResult(e,l.score,l.rating,l.details)},s=e.querySelector("#calculateJobWorth");s&&s.addEventListener("click",a),e.querySelectorAll("input, select").forEach(o=>{o.addEventListener("input",a),o.addEventListener("change",a)})}computeJobWorth(e,t,i){const s=52*e.workDaysPerWeek,n=e.annualLeave+e.publicHolidays,o=Math.max(s-n,1),l=t[e.country]||4.19,d=e.salary*(4.19/l)/o,c=e.workDaysPerWeek>0?(e.workDaysPerWeek-Math.min(e.wfhDays,e.workDaysPerWeek))/e.workDaysPerWeek:0,p=e.hasShuttle?e.shuttleBus:1,v=e.commuteHours*c*p,y=e.hasCanteen?e.cafeteria:1,u=e.cityLevel*e.workEnvironment*e.teamwork*e.leadership*y,m=this.calculateExperienceMultiplier(e.workYears,e.jobType),h=e.restTime||0,f=e.workHoursPerDay+v-.5*h,w=d*u/(35*f*e.education*m),x=this.getJobWorthRating(w);return{score:w,rating:x,details:{dailySalary:d,workDaysPerYear:o,totalTimeInvestment:f,environmentFactor:u,experienceMultiplier:m,currencySymbol:i[e.country]||"¥"}}}calculateExperienceMultiplier(e,t){let i=1;if(e===0)i={government:.8,state:.9,foreign:.95,private:1,startup:1.1}[t]||1;else{e===1?i=1.5:e<=3?i=2.2:e<=5?i=2.7:e<=8?i=3.2:e<=10?i=3.6:i=3.9;const s={government:.2,state:.4,foreign:.8,private:1,startup:1.2}[t]||1;i=1+(i-1)*s}return i}getJobWorthRating(e){return e<.6?{text:"惨绝人寰",color:"#9d174d",class:"terrible"}:e<1?{text:"略惨",color:"#ef4444",class:"poor"}:e<1.5?{text:"一般",color:"#f97316",class:"average"}:e<2.5?{text:"还不错",color:"#3b82f6",class:"good"}:e<4?{text:"很爽",color:"#22c55e",class:"great"}:e<6?{text:"爽到爆炸",color:"#a855f7",class:"excellent"}:{text:"人生巅峰",color:"#facc15",class:"perfect"}}displayJobWorthResult(e,t,i,a){const s=e.querySelector("#jobWorthResult"),n=e.querySelector("#jobWorthScore"),o=e.querySelector("#jobWorthRating");if(s&&n&&o){if(s.style.display="block",n.textContent=t.toFixed(2),typeof i=="object"?(o.textContent=i.text,o.style.color=i.color,o.className=`score-label ${i.class}`):(o.textContent=i,o.style.color="#6b7280",o.className="score-label"),a.dailySalary){const l=e.querySelector("#dailySalaryDisplay");l&&(l.textContent=`${a.currencySymbol}${a.dailySalary.toFixed(0)}`)}if(a.workDaysPerYear){const l=e.querySelector("#workDaysDisplay");l&&(l.textContent=`${a.workDaysPerYear}天`)}if(a.totalTimeInvestment){const l=e.querySelector("#totalTimeDisplay");l&&(l.textContent=`${a.totalTimeInvestment.toFixed(1)}小时`)}if(a.environmentFactor){const l=e.querySelector("#environmentFactorDisplay");l&&(l.textContent=a.environmentFactor.toFixed(2))}}}}class q{constructor(){this.pppFactors={CN:4.19,US:1,JP:102.84,KR:870,SG:1.35,HK:6.07,TW:28.5,GB:.7,DE:.75,FR:.73,AU:1.47,CA:1.21,IN:21.99,TH:10.5,MY:1.7},this.currencySymbols={CN:"¥",US:"$",JP:"¥",KR:"₩",SG:"S$",HK:"HK$",TW:"NT$",GB:"£",DE:"€",FR:"€",AU:"A$",CA:"C$",IN:"₹",TH:"฿",MY:"RM"},this.countryNames={CN:"中国",US:"美国",JP:"日本",KR:"韩国",SG:"新加坡",HK:"香港",TW:"台湾",GB:"英国",DE:"德国",FR:"法国",AU:"澳大利亚",CA:"加拿大",IN:"印度",TH:"泰国",MY:"马来西亚"},this.initializeJobWorthCalculator()}initializeJobWorthCalculator(){this.createJobWorthInterface(),this.bindJobWorthEvents()}createJobWorthInterface(){const e=document.createElement("div");e.id="jobWorthCalculator",e.className="calculator-section",e.style.display="none",e.innerHTML=`
      <div class="calculator-container">
        <div class="calculator-header">
          <h2>💼 这个班值不值得上计算器</h2>
          <p>全面评估工作的真实价值，不只是薪资那么简单</p>
        </div>

        <div class="job-worth-form">
          <!-- 基础薪资信息 -->
          <div class="form-section">
            <h3>💰 薪资信息</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="jobSalary">年薪</label>
                <input type="number" id="jobSalary" placeholder="请输入年薪">
              </div>
              <div class="form-group">
                <label for="jobCountry">工作国家/地区</label>
                <select id="jobCountry">
                  ${Object.entries(this.countryNames).map(([i,a])=>`<option value="${i}">${a} (PPP: ${this.pppFactors[i]?.toFixed(2)||"N/A"})</option>`).join("")}
                </select>
              </div>
            </div>
          </div>

          <!-- 工作时间 -->
          <div class="form-section">
            <h3>⏰ 工作时间</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="workDaysPerWeek">每周工作天数</label>
                <input type="number" id="workDaysPerWeek" value="5" min="1" max="7">
              </div>
              <div class="form-group">
                <label for="workHoursPerDay">每日工作小时</label>
                <input type="number" id="workHoursPerDay" value="8" min="1" max="24" step="0.5">
              </div>
              <div class="form-group">
                <label for="commuteHours">每日通勤小时</label>
                <input type="number" id="commuteHours" value="1" min="0" max="8" step="0.5">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="wfhDays">每周远程天数</label>
                <input type="number" id="wfhDays" value="0" min="0" max="7">
              </div>
              <div class="form-group">
                <label for="annualLeave">年假天数</label>
                <input type="number" id="annualLeave" value="5" min="0" max="30">
              </div>
              <div class="form-group">
                <label for="publicHolidays">法定假期天数</label>
                <input type="number" id="publicHolidays" value="11" min="0" max="30">
              </div>
            </div>
          </div>

          <!-- 工作环境 -->
          <div class="form-section">
            <h3>🏢 工作环境</h3>

            <!-- 地理位置 -->
            <div class="environment-subsection">
              <h4>📍 地理位置</h4>
              <div class="form-row">
                <div class="form-group">
                  <label for="cityLevel">城市等级</label>
                  <select id="cityLevel">
                    <option value="0.70">一线城市</option>
                    <option value="0.80">新一线城市</option>
                    <option value="1.0" selected>二线城市</option>
                    <option value="1.10">三线城市</option>
                    <option value="1.25">四线城市</option>
                    <option value="1.40">县城</option>
                    <option value="1.50">乡镇</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="hometown">是否在家乡工作</label>
                  <select id="hometown">
                    <option value="no" selected>不在家乡</option>
                    <option value="yes">在家乡</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 工作环境 -->
            <div class="environment-subsection">
              <h4>🏭 工作环境</h4>
              <div class="form-group">
                <label for="workEnvironment">工作环境类型</label>
                <select id="workEnvironment">
                  <option value="0.8">偏僻的工厂/工地/户外</option>
                  <option value="0.9">工厂/工地/户外</option>
                  <option value="1.0" selected>普通环境</option>
                  <option value="1.1">CBD</option>
                </select>
              </div>
            </div>

            <!-- 人际关系 -->
            <div class="environment-subsection">
              <h4>👥 人际关系</h4>
              <div class="form-row">
                <div class="form-group">
                  <label for="leadership">领导/老板</label>
                  <select id="leadership">
                    <option value="0.7">对我不爽</option>
                    <option value="0.9">管理严格</option>
                    <option value="1.0" selected>中规中矩</option>
                    <option value="1.1">普通人缘</option>
                    <option value="1.3">我是爆亲</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="teamwork">同事环境</label>
                  <select id="teamwork">
                    <option value="0.9">都是傻逼</option>
                    <option value="1.0" selected>冲水柜道</option>
                    <option value="1.1">和谐融洽</option>
                    <option value="1.2">私交甚好</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- 福利待遇 -->
          <div class="form-section">
            <h3>🎁 福利待遇</h3>

            <!-- 班车服务 -->
            <div class="welfare-subsection">
              <h4>🚌 班车服务</h4>
              <div class="form-group">
                <label>
                  <input type="checkbox" id="hasShuttle" checked>
                  公司提供班车服务
                </label>
              </div>
              <div class="form-group">
                <label for="shuttleBus">班车便利度</label>
                <select id="shuttleBus">
                  <option value="0.8">无法抵达</option>
                  <option value="0.9">班车不便</option>
                  <option value="1.0" selected>便利班车</option>
                  <option value="1.1">班车直达</option>
                </select>
              </div>
            </div>

            <!-- 食堂情况 -->
            <div class="welfare-subsection">
              <h4>🍽️ 食堂情况</h4>
              <div class="form-group">
                <label>
                  <input type="checkbox" id="hasCanteen" checked>
                  公司提供食堂服务
                </label>
              </div>
              <div class="form-group">
                <label for="cafeteria">食堂质量</label>
                <select id="cafeteria">
                  <option value="0.8">无法抵达</option>
                  <option value="0.9">冲水柜道</option>
                  <option value="1.0" selected>和谐融洽</option>
                  <option value="1.1">私交甚好</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 个人背景 -->
          <div class="form-section">
            <h3>🎓 个人背景</h3>

            <!-- 学历系统优化 -->
            <div class="education-section">
              <h4>📚 学历背景</h4>
              <div class="form-row">
                <div class="form-group">
                  <label for="degreeType">学位类型</label>
                  <select id="degreeType">
                    <option value="belowBachelor">专科及以下</option>
                    <option value="bachelor" selected>本科</option>
                    <option value="masters">硕士</option>
                    <option value="phd">博士</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="schoolType">学校类型</label>
                  <select id="schoolType">
                    <option value="secondTier">二本三本</option>
                    <option value="firstTier" selected>双非/QS200/USnews80</option>
                    <option value="elite">985211/QS50/USnews30</option>
                  </select>
                </div>
              </div>
              <!-- 硕士本科背景选择 -->
              <div class="form-group bachelor-background" style="display: none;">
                <label for="bachelorType">本科背景</label>
                <select id="bachelorType">
                  <option value="secondTier">二本三本</option>
                  <option value="firstTier" selected>双非/QS200/USnews80</option>
                  <option value="elite">985211/QS50/USnews30</option>
                </select>
              </div>
              <!-- 隐藏的教育系数字段，用于兼容现有计算逻辑 -->
              <input type="hidden" id="education" value="1.0">
            </div>

            <!-- 工作经历 -->
            <div class="form-row">
              <div class="form-group">
                <label for="workYears">工作年限</label>
                <select id="workYears">
                  <option value="0" selected>应届生</option>
                  <option value="1">1-3年</option>
                  <option value="3">3-5年</option>
                  <option value="5">5-8年</option>
                  <option value="8">8-10年</option>
                  <option value="10">10-12年</option>
                  <option value="12">12年以上</option>
                </select>
              </div>
              <div class="form-group">
                <label for="jobType">职业稳定度</label>
                <select id="jobType">
                  <option value="government">政府/事业单位</option>
                  <option value="state">国企/大型企业</option>
                  <option value="foreign">外企/守法企业</option>
                  <option value="private" selected>私企/领件工厂</option>
                  <option value="dispatch">劳务派遣/OD</option>
                  <option value="freelance">自由职业</option>
                </select>
              </div>
            </div>
          </div>

          <div class="calculate-button-container">
            <button id="calculateJobWorth" class="calculate-btn">
              计算工作价值
            </button>
          </div>
        </div>

        <!-- 结果显示区域 -->
        <div id="jobWorthResult" class="result-section" style="display: none;">
          <div class="result-header">
            <h3>📊 工作价值评估结果</h3>
          </div>
          <div class="result-content">
            <div class="result-score">
              <div class="score-value" id="jobWorthScore">0.00</div>
              <div class="score-label" id="jobWorthRating">请输入信息</div>
            </div>
            <div class="result-details">
              <div class="detail-item">
                <span class="detail-label">标准化日薪：</span>
                <span class="detail-value" id="dailySalaryDisplay">¥0</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">年工作天数：</span>
                <span class="detail-value" id="workDaysDisplay">0天</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">每日总时间投入：</span>
                <span class="detail-value" id="totalTimeDisplay">0小时</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">环境调整系数：</span>
                <span class="detail-value" id="environmentFactorDisplay">1.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,(document.querySelector(".app-container")||document.body).appendChild(e)}bindJobWorthEvents(){const e=document.getElementById("calculateJobWorth");e&&e.addEventListener("click",()=>this.calculateJobWorth()),this.bindEducationEvents();const t=["jobSalary","workDaysPerWeek","workHoursPerDay","commuteHours","wfhDays","annualLeave","publicHolidays","workYears","restTime","paidSickLeave"],i=["jobCountry","cityLevel","workEnvironment","teamwork","education","jobType","degreeType","schoolType","bachelorType","hometown","leadership","shuttleBus","cafeteria"],a=["hasShuttle","hasCanteen"];[...t,...i,...a].forEach(s=>{const n=document.getElementById(s);n&&(n.addEventListener("input",()=>this.calculateJobWorth()),n.addEventListener("change",()=>this.calculateJobWorth()))})}bindEducationEvents(){const e=document.getElementById("degreeType"),t=document.getElementById("schoolType"),i=document.getElementById("bachelorType"),a=document.querySelector(".bachelor-background");document.getElementById("education"),e&&e.addEventListener("change",()=>{const s=e.value;a&&(a.style.display=s==="masters"?"block":"none"),this.updateSchoolTypeOptions(s),this.updateEducationFactor()}),t&&t.addEventListener("change",()=>{this.updateEducationFactor()}),i&&i.addEventListener("change",()=>{this.updateEducationFactor()}),this.updateEducationFactor()}updateSchoolTypeOptions(e){const t=document.getElementById("schoolType");t&&(t.innerHTML="",e==="belowBachelor"?(t.innerHTML='<option value="secondTier" selected>专科院校</option>',t.disabled=!0):(t.disabled=!1,e==="bachelor"?t.innerHTML=`
          <option value="secondTier">二本三本</option>
          <option value="firstTier" selected>双非/QS200/USnews80</option>
          <option value="elite">985211/QS50/USnews30</option>
        `:t.innerHTML=`
          <option value="secondTier">二本三本</option>
          <option value="firstTier" selected>双非/QS100/USnews50</option>
          <option value="elite">985211/QS30/USnews20</option>
        `))}updateEducationFactor(){const e=document.getElementById("degreeType")?.value||"bachelor",t=document.getElementById("schoolType")?.value||"firstTier",i=document.getElementById("bachelorType")?.value||"firstTier",a=document.getElementById("education");let s=1;if(e==="belowBachelor")s=.8;else if(e==="bachelor")t==="secondTier"?s=.9:t==="firstTier"?s=1:t==="elite"&&(s=1.2);else if(e==="masters"){let n=0;i==="secondTier"?n=.9:i==="firstTier"?n=1:i==="elite"&&(n=1.2);let o=0;t==="secondTier"?o=.4:t==="firstTier"?o=.5:t==="elite"&&(o=.6),s=n+o}else e==="phd"&&(t==="secondTier"?s=1.6:t==="firstTier"?s=1.8:t==="elite"&&(s=2));a&&(a.value=s.toFixed(2)),console.log(`教育系数更新: ${e} + ${t} + ${i} = ${s.toFixed(2)}`)}calculateJobWorth(){const e=this.getFormData();if(!e.salary){this.displayResult(0,"请输入年薪",{});return}const t=this.computeJobWorth(e);this.displayResult(t.score,t.rating,t.details)}getFormData(){return{salary:parseFloat(document.getElementById("jobSalary")?.value)||0,country:document.getElementById("jobCountry")?.value||"CN",workDaysPerWeek:parseFloat(document.getElementById("workDaysPerWeek")?.value)||5,workHoursPerDay:parseFloat(document.getElementById("workHoursPerDay")?.value)||8,commuteHours:parseFloat(document.getElementById("commuteHours")?.value)||1,wfhDays:parseFloat(document.getElementById("wfhDays")?.value)||0,annualLeave:parseFloat(document.getElementById("annualLeave")?.value)||5,publicHolidays:parseFloat(document.getElementById("publicHolidays")?.value)||11,cityLevel:parseFloat(document.getElementById("cityLevel")?.value)||1,workEnvironment:parseFloat(document.getElementById("workEnvironment")?.value)||1,teamwork:parseFloat(document.getElementById("teamwork")?.value)||1,education:parseFloat(document.getElementById("education")?.value)||1,workYears:parseFloat(document.getElementById("workYears")?.value)||0,jobType:document.getElementById("jobType")?.value||"private",hometown:document.getElementById("hometown")?.value||"no",leadership:parseFloat(document.getElementById("leadership")?.value)||1,shuttleBus:parseFloat(document.getElementById("shuttleBus")?.value)||1,cafeteria:parseFloat(document.getElementById("cafeteria")?.value)||1,hasShuttle:document.getElementById("hasShuttle")?.checked||!1,hasCanteen:document.getElementById("hasCanteen")?.checked||!1,restTime:parseFloat(document.getElementById("restTime")?.value)||0,paidSickLeave:parseFloat(document.getElementById("paidSickLeave")?.value)||0}}computeJobWorth(e){const i=52*e.workDaysPerWeek,a=e.annualLeave+e.publicHolidays,s=Math.max(i-a,1),n=this.pppFactors[e.country]||4.19,l=e.salary*(4.19/n)/s,r=e.workDaysPerWeek>0?(e.workDaysPerWeek-Math.min(e.wfhDays,e.workDaysPerWeek))/e.workDaysPerWeek:0,d=e.hasShuttle?e.shuttleBus:1,c=e.commuteHours*r*d,p=e.hasCanteen?e.cafeteria:1,v=e.cityLevel*e.workEnvironment*e.teamwork*e.leadership*p,y=this.calculateExperienceMultiplier(e.workYears,e.jobType),u=e.restTime||0,m=e.workHoursPerDay+c-.5*u,h=l*v/(35*m*e.education*y),f=this.getRating(h);return{score:h,rating:f,details:{dailySalary:l,workDaysPerYear:s,totalTimeInvestment:m,environmentFactor:v,experienceMultiplier:y,currencySymbol:this.currencySymbols[e.country]||"¥"}}}calculateExperienceMultiplier(e,t){let i=1;if(e===0)i={government:.8,state:.9,foreign:.95,private:1,startup:1.1}[t]||1;else{e===1?i=1.5:e<=3?i=2.2:e<=5?i=2.7:e<=8?i=3.2:e<=10?i=3.6:i=3.9;const s={government:.2,state:.4,foreign:.8,private:1,startup:1.2}[t]||1;i=1+(i-1)*s}return i}getRating(e){return e<.6?{text:"惨绝人寰",color:"#9d174d",class:"terrible"}:e<1?{text:"略惨",color:"#ef4444",class:"poor"}:e<1.5?{text:"一般",color:"#f97316",class:"average"}:e<2.5?{text:"还不错",color:"#3b82f6",class:"good"}:e<4?{text:"很爽",color:"#22c55e",class:"great"}:e<6?{text:"爽到爆炸",color:"#a855f7",class:"excellent"}:{text:"人生巅峰",color:"#facc15",class:"perfect"}}displayResult(e,t,i){const a=document.getElementById("jobWorthResult"),s=document.getElementById("jobWorthScore"),n=document.getElementById("jobWorthRating");a&&s&&n&&(a.style.display="block",s.textContent=e.toFixed(2),typeof t=="object"?(n.textContent=t.text,n.style.color=t.color,n.className=`score-label ${t.class}`):(n.textContent=t,n.style.color="#6b7280",n.className="score-label"),i.dailySalary&&(document.getElementById("dailySalaryDisplay").textContent=`${i.currencySymbol}${i.dailySalary.toFixed(0)}`),i.workDaysPerYear&&(document.getElementById("workDaysDisplay").textContent=`${i.workDaysPerYear}天`),i.totalTimeInvestment&&(document.getElementById("totalTimeDisplay").textContent=`${i.totalTimeInvestment.toFixed(1)}小时`),i.environmentFactor&&(document.getElementById("environmentFactorDisplay").textContent=i.environmentFactor.toFixed(2)))}show(){const e=document.getElementById("jobWorthCalculator");e&&(e.style.display="block")}hide(){const e=document.getElementById("jobWorthCalculator");e&&(e.style.display="none")}}const V=new W;window.financialApp=V;const H=new q;window.jobWorthCalculator=H;window.financialApp.handleChartMouseMove=function(g,e,t,i,a,s,n){try{const l=g.currentTarget.closest("svg").getBoundingClientRect(),r=g.clientX-l.left,d=g.clientY-l.top,c=r/l.width*s;if(d/l.height*(a+50)>a)return;const v=Math.round(c/s*(t.length-1)),y=Math.max(0,Math.min(t.length-1,v)),u=t[y];if(!u)return;this.showChartTooltip(e,g.clientX,g.clientY,u,n)}catch(o){console.error("图表鼠标移动处理错误:",o)}};window.financialApp.showChartTooltip=function(g,e,t,i,a){const s=document.getElementById(`chart-tooltip-${g}`);if(!s)return;const n=a?`第${i.month}个月`:`第${i.year}年`,o=(i.totalWealth/1e4).toFixed(1),l=(i.totalSavings/1e4).toFixed(1),r=((i.totalInvestmentReturn||0)/1e4).toFixed(1);s.querySelector(".tooltip-content").innerHTML=`
      <div style="font-weight: bold; margin-bottom: 4px;">${n}</div>
      <div style="color: #f59e0b;">💰 总财富: ${o}万元</div>
      <div style="color: #3b82f6;">💵 累计储蓄: ${l}万元</div>
      <div style="color: #10b981;">📈 投资收益: ${r}万元</div>
    `;const d=s.parentElement,c=d.getBoundingClientRect();let p=e-c.left+10,v=t-c.top-10;p+s.offsetWidth>d.offsetWidth&&(p=e-c.left-s.offsetWidth-10),v<0&&(v=t-c.top+20),s.style.left=p+"px",s.style.top=v+"px",s.style.opacity="1"};window.financialApp.hideChartTooltip=function(g){const e=document.getElementById(`chart-tooltip-${g}`);e&&(e.style.opacity="0")};window.financialApp.initChartInteraction=function(g){window.financialApp||(window.financialApp=this),console.log(`图表 ${g} 交互功能已初始化`)};
