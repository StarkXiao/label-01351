// app.js
App({
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    baseUrl: 'http://localhost:3000'
  },

  onLaunch() {
    // 初始化登录状态
    this.checkLoginStatus();
    // 初始化 Mock 数据
    this.initMockData();
  },

  // 检查登录状态
  checkLoginStatus() {
    const isLoggedIn = wx.getStorageSync('isLoggedIn') || false;
    const userInfo = wx.getStorageSync('userInfo');
    
    if (isLoggedIn && userInfo) {
      this.globalData.isLoggedIn = true;
      this.globalData.userInfo = userInfo;
    } else {
      this.globalData.isLoggedIn = false;
      this.globalData.userInfo = null;
    }
  },

  // 登录
  login(userInfo) {
    const user = userInfo || {
      id: 'user_' + Date.now(),
      nickname: '乡村文化爱好者',
      avatar: '',
      phone: '',
      createTime: new Date().toISOString().split('T')[0]
    };
    
    wx.setStorageSync('userInfo', user);
    wx.setStorageSync('isLoggedIn', true);
    this.globalData.userInfo = user;
    this.globalData.isLoggedIn = true;
    
    return user;
  },

  // 退出登录
  logout() {
    wx.removeStorageSync('isLoggedIn');
    this.globalData.isLoggedIn = false;
    this.globalData.userInfo = null;
  },

  // 检查是否登录，未登录则跳转登录页
  checkLogin() {
    if (!this.globalData.isLoggedIn) {
      wx.navigateTo({
        url: '/pages/login/login'
      });
      return false;
    }
    return true;
  },

  // 获取用户信息
  getUserInfo() {
    return this.globalData.userInfo;
  },

  // 获取登录状态
  getLoginStatus() {
    return this.globalData.isLoggedIn;
  },

  // 更新用户信息
  updateUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo);
  },

  // 初始化 Mock 数据
  initMockData() {
    // 检查是否已有文章数据
    const articles = wx.getStorageSync('articles');
    if (!articles || articles.length === 0) {
      const defaultArticles = [
        {
          id: 'article_001',
          title: '记忆中的农耕岁月',
          content: '在我的记忆里，每年春耕时节，父亲总是天不亮就起床，扛着锄头走向田间。那时候没有机械化，全靠人力和牛力。父亲说，种地要看天时，要懂得节气。',
          category: 'farming',
          authorId: 'user_001',
          authorName: '张大爷',
          viewCount: 328,
          likeCount: 56,
          createTime: '2024-12-15',
          status: 1
        },
        {
          id: 'article_002',
          title: '外婆的织布手艺',
          content: '外婆今年八十五岁了，她的织布手艺在村里是出了名的。从我记事起，外婆家的堂屋里就摆着一台老式织布机，那是外公年轻时亲手做的。',
          category: 'craft',
          authorId: 'user_002',
          authorName: '李阿姨',
          viewCount: 256,
          likeCount: 89,
          createTime: '2024-12-10',
          status: 1
        },
        {
          id: 'article_003',
          title: '村口老槐树的故事',
          content: '我们村口有一棵老槐树，听村里最年长的王爷爷说，这棵树少说也有三百年了。树干粗得要三个大人才能合抱，树冠像一把巨大的绿伞。',
          category: 'memory',
          authorId: 'user_003',
          authorName: '王老师',
          viewCount: 412,
          likeCount: 127,
          createTime: '2024-12-08',
          status: 1
        },
        {
          id: 'article_004',
          title: '端午节的老习俗',
          content: '在我们村，端午节是一年中最热闹的节日之一。从五月初一开始，家家户户就忙活起来了。首先是包粽子，奶奶会提前一天把糯米泡好。',
          category: 'folklore',
          authorId: 'user_004',
          authorName: '陈奶奶',
          viewCount: 567,
          likeCount: 203,
          createTime: '2024-12-05',
          status: 1
        },
        {
          id: 'article_005',
          title: '爷爷的二十四节气歌',
          content: '爷爷是村里有名的"老把式"，种了一辈子地，对节气了如指掌。他常念叨的二十四节气歌，我到现在还记得。',
          category: 'farming',
          authorId: 'user_005',
          authorName: '刘大伯',
          viewCount: 389,
          likeCount: 145,
          createTime: '2024-12-01',
          status: 1
        }
      ];
      wx.setStorageSync('articles', defaultArticles);
    }

    // 初始化分类数据
    const categories = wx.getStorageSync('categories');
    if (!categories || categories.length === 0) {
      const defaultCategories = [
        { id: 'all', name: '全部', icon: 'all', sort: 0 },
        { id: 'folklore', name: '民俗故事', icon: 'folklore', sort: 1 },
        { id: 'farming', name: '农耕智慧', icon: 'farming', sort: 2 },
        { id: 'craft', name: '传统技艺', icon: 'craft', sort: 3 },
        { id: 'memory', name: '乡土记忆', icon: 'memory', sort: 4 }
      ];
      wx.setStorageSync('categories', defaultCategories);
    }

    // 初始化问答数据
    const questions = wx.getStorageSync('questions');
    if (!questions || questions.length === 0) {
      const defaultQuestions = [
        {
          id: 'question_001',
          title: '端午节为什么要吃粽子？',
          content: '听说端午节吃粽子是为了纪念屈原，但具体是怎么回事呢？',
          category: 'folklore',
          authorId: 'user_001',
          authorName: '张大爷',
          viewCount: 156,
          answerCount: 2,
          createTime: '2024-12-20',
          status: 1,
          answers: [
            {
              id: 'answer_001',
              content: '端午节吃粽子确实是为了纪念屈原。相传屈原投江后，百姓们怕江里的鱼虾咬食屈原的身体，就用竹筒装米投入江中，后来逐渐演变成了粽子。',
              authorId: 'user_002',
              authorName: '李阿姨',
              createTime: '2024-12-20',
              likeCount: 8
            },
            {
              id: 'answer_002',
              authorName: '王老师',
              content: '除了纪念屈原，粽子也有祈求丰收、驱邪避瘟的寓意。在古代，人们认为粽子的形状像牛角，有祭祀祖先和神灵的意义。',
              authorId: 'user_003',
              createTime: '2024-12-21',
              likeCount: 12
            }
          ]
        },
        {
          id: 'question_002',
          title: '春耕有什么讲究？',
          content: '马上就要到春耕时节了，想问问大家春耕都有哪些需要注意的地方？',
          authorId: 'user_004',
          authorName: '陈奶奶',
          category: 'farming',
          viewCount: 234,
          answerCount: 1,
          createTime: '2024-12-18',
          status: 1,
          answers: [
            {
              id: 'answer_003',
              content: '春耕最重要的是看节气，清明前后是种瓜点豆的好时候。还要看天气，不能太早也不能太晚。种地要根据不同的作物选择合适的时间。',
              authorId: 'user_005',
              authorName: '刘大伯',
              createTime: '2024-12-18',
              likeCount: 15
            }
          ]
        },
        {
          id: 'question_003',
          title: '如何制作传统的布鞋？',
          content: '小时候穿过奶奶做的布鞋特别舒服，想知道具体是怎么做的？',
          authorId: 'user_002',
          authorName: '李阿姨',
          category: 'craft',
          viewCount: 189,
          answerCount: 0,
          createTime: '2024-12-15',
          status: 1,
          answers: []
        }
      ];
      wx.setStorageSync('questions', defaultQuestions);
    }
  }
});
