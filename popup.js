document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const settingsPanel = document.getElementById('settingsPanel');
  const noSettingsTip = document.getElementById('noSettingsTip');
  const infoPanel = document.getElementById('infoPanel');
  const showSettingsBtn = document.getElementById('showSettings');
  const editSettingsBtn = document.getElementById('editSettings');
  const workStartTime = document.getElementById('workStartTime');
  const workEndTime = document.getElementById('workEndTime');
  const breakStartTime = document.getElementById('breakStartTime');
  const breakEndTime = document.getElementById('breakEndTime');
  const monthlySalary = document.getElementById('monthlySalary');
  const workDaysPerMonth = document.getElementById('workDaysPerMonth');
  const saveButton = document.getElementById('saveSettings');
  const timeLeftElement = document.getElementById('timeLeft');
  const progressElement = document.getElementById('progress');
  const earnedTodayElement = document.getElementById('earnedToday');
  const quoteElement = document.getElementById('dailyQuote');
  const holidayCountdownElement = document.getElementById('holidayCountdown');
  const nextHolidayNameElement = document.getElementById('nextHolidayName');

  // 励志语录数组
  const quotes = [
    "今天的汗水是明天的收获",
    "每一份努力都是为了更好的自己",
    "摸鱼虽快乐，但梦想更重要",
    "你的工资是你对社会贡献的证明",
    "今天的事情不要拖到明天",
    "既然选择了远方，便只顾风雨兼程",
    "没有人能够随随便便成功",
    "只要努力，一切皆有可能",
    "每一个优秀的人，都有一段沉默的时光",
    "不要让任何事情成为你不努力的理由",
    "成功不是偶然的，而是来自日复一日的积累",
    "不要让懒惰毁了你的未来",
    "你的努力，终将成为未来的底气",
    "坚持下去，你就是自己的光",
    "今天的努力是为了明天更好的生活",
    "别人的成功不是你的失败，你的不努力才是",
    "只要坚持，就没有什么是不可能的",
    "生活不会辜负每一个努力的人",
    "不要因为走得太远而忘记为什么出发",
    "加油，你比想象中更优秀"
  ];

  // 获取节假日信息
  async function fetchHolidays() {
    try {
      const year = new Date().getFullYear();
      const response = await fetch(`https://api.apihubs.cn/holiday/get?field=date,holiday_name&year=${year}&holiday_type=1&size=50`);
      const data = await response.json();
      
      if (data.code === 0 && data.data.list) {
        return data.data.list.map(item => ({
          name: item.holiday_name,
          date: item.date,
          isHoliday: true
        }));
      }
      throw new Error('获取节假日数据失败');
    } catch (error) {
      console.error('获取节假日信息失败:', error);
      // 更新2025年的备用节假日数据
      const currentYear = new Date().getFullYear();
      return [
        { name: "元旦", date: `${currentYear}-01-01` },
        { name: "春节", date: `${currentYear}-01-29` },
        { name: "清明节", date: `${currentYear}-04-05` },
        { name: "劳动节", date: `${currentYear}-05-01` },
        { name: "端午节", date: `${currentYear}-06-29` },
        { name: "中秋节", date: `${currentYear}-09-06` },
        { name: "国庆节", date: `${currentYear}-10-01` }
      ];
    }
  }

  // 获取随机语录
  function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }

  // 显示随机语录
  function showRandomQuote() {
    quoteElement.textContent = getRandomQuote();
  }

  // 显示设置面板
  function showSettingsPanel() {
    settingsPanel.classList.remove('hidden');
    noSettingsTip.classList.add('hidden');
    infoPanel.classList.add('hidden');
  }

  // 显示信息面板
  function showInfoPanel() {
    settingsPanel.classList.add('hidden');
    noSettingsTip.classList.add('hidden');
    infoPanel.classList.remove('hidden');
  }

  // 显示未配置提示
  function showNoSettingsTip() {
    settingsPanel.classList.add('hidden');
    noSettingsTip.classList.remove('hidden');
    infoPanel.classList.add('hidden');
  }

  // 修改获取下一个节假日的函数
  async function getNextHoliday() {
    const holidays = await fetchHolidays();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const holiday of holidays) {
      const holidayDate = new Date(holiday.date);
      if (holidayDate >= today) {
        return {
          name: holiday.name,
          date: holidayDate
        };
      }
    }
    
    // 如果今年的节假日都过完了，尝试获取下一年的数据
    try {
      const nextYear = today.getFullYear() + 1;
      const response = await fetch(`https://api.apihubs.cn/holiday/get?field=date,holiday_name&year=${nextYear}&holiday_type=1&size=50`);
      const data = await response.json();
      
      if (data.code === 0 && data.data.list && data.data.list.length > 0) {
        const nextYearHolidays = data.data.list
          .map(item => ({
            name: item.holiday_name,
            date: item.date,
            isHoliday: true
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (nextYearHolidays.length > 0) {
          return {
            name: nextYearHolidays[0].name,
            date: new Date(nextYearHolidays[0].date)
          };
        }
      }
      throw new Error('获取下一年节假日数据失败');
    } catch (error) {
      console.error('获取下一年节假日失败:', error);
      const nextYear = today.getFullYear() + 1;
      return {
        name: "元旦",
        date: new Date(`${nextYear}-01-01`)
      };
    }
  }

  // 修改更新节假日倒计时的函数
  async function updateHolidayCountdown() {
    try {
      const nextHoliday = await getNextHoliday();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const timeDiff = nextHoliday.date.getTime() - today.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      nextHolidayNameElement.textContent = nextHoliday.name;
      holidayCountdownElement.textContent = `${daysLeft}天`;
    } catch (error) {
      console.error('更新节假日倒计时失败:', error);
      nextHolidayNameElement.textContent = '下个假期';
      holidayCountdownElement.textContent = '获取中...';
    }
  }

  // 加载保存的设置
  chrome.storage.sync.get([
    'workStartTime', 
    'workEndTime', 
    'breakStartTime',
    'breakEndTime',
    'monthlySalary', 
    'workDaysPerMonth'
  ], function(data) {
    // 显示随机语录
    showRandomQuote();
    // 更新节假日倒计时
    updateHolidayCountdown();
    
    workStartTime.value = data.workStartTime || '';
    workEndTime.value = data.workEndTime || '';
    breakStartTime.value = data.breakStartTime || '';
    breakEndTime.value = data.breakEndTime || '';
    monthlySalary.value = data.monthlySalary || '';
    workDaysPerMonth.value = data.workDaysPerMonth || '';
    
    // 判断是否已配置
    if (data.workStartTime) {
      showInfoPanel();
      updateDisplay();
    } else {
      showNoSettingsTip();
    }
  });

  // 按钮事件监听
  showSettingsBtn.addEventListener('click', showSettingsPanel);
  editSettingsBtn.addEventListener('click', showSettingsPanel);

  // 保存设置
  saveButton.addEventListener('click', function() {
    if (!validateInputs()) {
      return;
    }
    
    chrome.storage.sync.set({
      workStartTime: workStartTime.value,
      workEndTime: workEndTime.value,
      breakStartTime: breakStartTime.value,
      breakEndTime: breakEndTime.value,
      monthlySalary: monthlySalary.value,
      workDaysPerMonth: workDaysPerMonth.value
    }, function() {
      alert('设置已保存！');
      showInfoPanel();
      updateDisplay();
    });
  });

  // 输入验证
  function validateInputs() {
    if (!workStartTime.value) {
      alert('请输入上班时间');
      return false;
    }
    if (!workEndTime.value) {
      alert('请输入下班时间');
      return false;
    }
    // 如果设置了午休开始时间，则必须设置结束时间
    if (breakStartTime.value && !breakEndTime.value) {
      alert('请输入午休结束时间');
      return false;
    }
    // 如果设置了午休结束时间，则必须设置开始时间
    if (breakEndTime.value && !breakStartTime.value) {
      alert('请输入午休开始时间');
      return false;
    }
    if (!monthlySalary.value || monthlySalary.value <= 0) {
      alert('请输入有效的月薪');
      return false;
    }
    if (!workDaysPerMonth.value || workDaysPerMonth.value < 1 || workDaysPerMonth.value > 31) {
      alert('请输入有效的月工作天数（1-31天）');
      return false;
    }
    return true;
  }

  // 更新倒计时和工资进度
  function updateDisplay() {
    const now = new Date();
    const [startHour, startMinute] = workStartTime.value.split(':');
    const [endHour, endMinute] = workEndTime.value.split(':');
    
    const startTime = new Date(now.setHours(startHour, startMinute, 0));
    const endTime = new Date(now.setHours(endHour, endMinute, 0));
    
    // 计算实际工作时间（考虑午休）
    let workDuration = endTime - startTime;
    if (breakStartTime.value && breakEndTime.value) {
      const [breakStartHour, breakStartMinute] = breakStartTime.value.split(':');
      const [breakEndHour, breakEndMinute] = breakEndTime.value.split(':');
      const breakStart = new Date(now.setHours(breakStartHour, breakStartMinute, 0));
      const breakEnd = new Date(now.setHours(breakEndHour, breakEndMinute, 0));
      const breakDuration = breakEnd - breakStart;
      workDuration -= breakDuration;
    }
    
    // 计算倒计时
    const timeLeft = endTime - new Date();
    if (timeLeft > 0) {
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      timeLeftElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    } else {
      timeLeftElement.textContent = '已下班';
    }

    // 计算工资进度（考虑午休时间）
    const dailySalary = monthlySalary.value / workDaysPerMonth.value;
    let elapsed = new Date() - startTime;
    
    // 如果当前时间在午休时间内，暂停计算
    if (breakStartTime.value && breakEndTime.value) {
      const [breakStartHour, breakStartMinute] = breakStartTime.value.split(':');
      const [breakEndHour, breakEndMinute] = breakEndTime.value.split(':');
      const breakStart = new Date(now.setHours(breakStartHour, breakStartMinute, 0));
      const breakEnd = new Date(now.setHours(breakEndHour, breakEndMinute, 0));
      const currentTime = new Date();
      
      if (currentTime >= breakStart && currentTime <= breakEnd) {
        elapsed = breakStart - startTime;
      } else if (currentTime > breakEnd) {
        elapsed -= (breakEnd - breakStart);
      }
    }
    
    const progress = Math.min(Math.max(elapsed / workDuration, 0), 1) * 100;
    const earned = (dailySalary * progress / 100).toFixed(2);

    progressElement.style.width = `${progress}%`;
    earnedTodayElement.textContent = `￥${earned}`;
  }

  let updateInterval;

  // 修改startUpdates函数
  function startUpdates() {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
    
    // 立即更新一次
    updateDisplay();
    updateHolidayCountdown();
    
    // 设置定时更新
    updateInterval = setInterval(() => {
      updateDisplay();
      updateHolidayCountdown();
    }, 60000);
    
    // 每天凌晨重新获取节假日数据
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeToMidnight = tomorrow - now;
    
    setTimeout(() => {
      updateHolidayCountdown();
      // 设置每24小时更新一次节假日数据
      setInterval(updateHolidayCountdown, 24 * 60 * 60 * 1000);
    }, timeToMidnight);
  }

  // 当插件弹出窗口打开时启动更新
  startUpdates();

  // 当插件弹出窗口关闭时清除定时器
  window.addEventListener('unload', function() {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
  });
}); 