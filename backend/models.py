from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

# Multi‑tenant support – each tenant (customer) gets its own isolated data set.
class Tenant(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    # Relationships
    users: List["User"] = Relationship(back_populates="tenant")
    simulations: List["Simulation"] = Relationship(back_populates="tenant")

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    hashed_password: str
    role: str = "red"  # red | blue | admin | client
    tenant_id: int = Field(foreign_key="tenant.id")
    tenant: Tenant = Relationship(back_populates="users")

class Simulation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    assets: str  # JSON‑encoded list of asset identifiers
    techniques: str  # JSON‑encoded list of ATT&CK technique IDs
    status: str = "running"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    tenant_id: int = Field(foreign_key="tenant.id")
    tenant: Tenant = Relationship(back_populates="simulations")
    evidence: List["Evidence"] = Relationship(back_populates="simulation")

class Evidence(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    simulation_id: int = Field(foreign_key="simulation.id")
    technique: str
    raw_log: str
    sigma_rule: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    simulation: Simulation = Relationship(back_populates="evidence")
