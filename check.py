from app import app

# 设置应用程序上下文
app.app_context().push()

# 现在可以执行需要应用程序上下文的操作了
from app.models import User, Game
from app import db

# 查询 User 表中的所有数据
users = User.query.all()
for user in users:
    print(user.username, user.email)


