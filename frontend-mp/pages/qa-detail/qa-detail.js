const api = require('../../utils/api');
const util = require('../../utils/util');

Page({
  data: {
    questionId: '',
    question: null,
    loading: true,
    showAnswerModal: false,
    answerContent: '',
    isLoggedIn: false
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ questionId: id });
    }
  },

  onShow() {
    const app = getApp();
    const isLoggedIn = app.getLoginStatus();
    this.setData({ isLoggedIn });
    
    if (isLoggedIn && this.data.questionId && !this.data.question) {
      this.loadQuestionDetail(this.data.questionId);
    }
  },

  async loadQuestionDetail(id) {
    this.setData({ loading: true });
    
    try {
      const res = await api.getQuestionDetail(id);
      
      if (res.code === 200 && res.data) {
        const question = {
          ...res.data,
          categoryName: util.getCategoryName(res.data.category)
        };
        
        this.setData({
          question,
          loading: false
        });
        
        wx.setNavigationBarTitle({
          title: question.title.length > 10 
            ? question.title.substring(0, 10) + '...' 
            : question.title
        });
      } else {
        this.setData({
          question: null,
          loading: false
        });
        wx.showToast({
          title: res.message || '问题加载失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[QADetail] 加载问题详情失败:', error);
      this.setData({
        question: null,
        loading: false
      });
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    }
  },

  openAnswerModal() {
    const app = getApp();
    if (!app.checkLogin()) {
      return;
    }
    this.setData({
      showAnswerModal: true,
      answerContent: ''
    });
  },

  closeAnswerModal() {
    this.setData({
      showAnswerModal: false,
      answerContent: ''
    });
  },

  onAnswerInput(e) {
    this.setData({
      answerContent: e.detail.value
    });
  },

  async submitAnswer() {
    const { answerContent, questionId } = this.data;
    
    if (!answerContent || !answerContent.trim()) {
      wx.showToast({
        title: '回答内容不能为空',
        icon: 'none'
      });
      return;
    }
    
    if (answerContent.length < 5) {
      wx.showToast({
        title: '回答至少5个字符',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({ title: '提交中...' });
    
    try {
      const res = await api.answerQuestion(questionId, {
        content: answerContent
      });
      
      wx.hideLoading();
      
      if (res.code === 200) {
        wx.showToast({
          title: '回答成功',
          icon: 'success'
        });
        
        this.closeAnswerModal();
        this.loadQuestionDetail(questionId);
      } else {
        wx.showToast({
          title: res.message || '回答失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[QADetail] 提交回答失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      });
    }
  },

  async onLikeAnswer(e) {
    const app = getApp();
    if (!app.checkLogin()) {
      return;
    }
    
    const { answerid } = e.currentTarget.dataset;
    const { questionId } = this.data;
    
    try {
      const res = await api.likeAnswer(questionId, answerid);
      
      if (res.code === 200) {
        const { question } = this.data;
        const answers = question.answers.map(answer => {
          if (answer.id === answerid) {
            return {
              ...answer,
              likeCount: res.data.likeCount
            };
          }
          return answer;
        });
        
        this.setData({
          'question.answers': answers
        });
        
        wx.showToast({
          title: '点赞成功',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: res.message || '点赞失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[QADetail] 点赞失败:', error);
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      });
    }
  },

  goBack() {
    wx.navigateBack();
  },

  onShareAppMessage() {
    const { question } = this.data;
    if (!question) return {};
    
    return {
      title: question.title,
      path: `/pages/qa-detail/qa-detail?id=${question.id}`
    };
  }
});
