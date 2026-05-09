/**
 * 自定义错误类
 */
class BlogError extends Error {
  timestamp: string;

  constructor(message: string) {
    super(message);
    this.name = 'BlogError';
    this.timestamp = new Date().toISOString(); // 错误发生时间

    // 确保原型链正确
    Object.setPrototypeOf(this, BlogError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      timestamp: this.timestamp
    };
  }
}

export default BlogError;