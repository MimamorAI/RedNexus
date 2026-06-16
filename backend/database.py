import os
from sqlmodel import SQLModel, create_engine, Session, select

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./test.db')
engine = create_engine(DATABASE_URL, echo=False)

def init_db():
    SQLModel.metadata.create_all(engine)
    # Ensure a default tenant exists (id=1)
    with Session(engine) as sess:
        from models import Tenant, User
        from auth import get_password_hash
        
        tenant = sess.exec(select(Tenant).where(Tenant.id == 1)).first()
        if not tenant:
            tenant = Tenant(id=1, name='default')
            sess.add(tenant)
            sess.commit()
        # Ensure a default admin user exists (username: admin, password: admin123) tied to tenant 1
        existing = sess.exec(select(User).where(User.username == 'admin')).first()
        if not existing:
            admin = User(username='admin', hashed_password=get_password_hash('admin123'), role='admin', tenant_id=tenant.id)
            sess.add(admin)
            sess.commit()

def get_session():
    return Session(engine)
