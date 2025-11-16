import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 读取 .env 文件
load_dotenv()

# 从环境变量获取完整的数据库连接地址
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# 创建数据库引擎
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 创建 Session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ORM 基类
Base = declarative_base()
