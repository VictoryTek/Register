"""
Add inventory group and item tables
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'aff9544ade85'
down_revision = 'f809530edd48'
branch_labels = None
depends_on = None


def upgrade():
    # Create inventory_group table
    op.create_table(
        'inventory_group',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # Create inventory_item table
    op.create_table(
        'inventory_item',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('price', sa.Numeric(10, 2), nullable=False),
        sa.Column('group_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['group_id'], ['inventory_group.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )


def downgrade():
    # Drop inventory_item table
    op.drop_table('inventory_item')

    # Drop inventory_group table
    op.drop_table('inventory_group')