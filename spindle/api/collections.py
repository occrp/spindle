from flask import Blueprint, request
from apikit import obj_or_404, Pager, jsonify, request_data
from sqlalchemy.orm import subqueryload

from loom.db import session, Collection
from spindle import authz
from spindle.model import Permission
from spindle.validation import validate
from spindle.logic.collections import update_subjects

collections_schema = 'https://schema.occrp.org/operational/collection.json#'
collections_api = Blueprint('collections', __name__)


def get_collection(id, right):
    collection = session.query(Collection).filter(Collection.id == id).first()
    collection = obj_or_404(collection)
    authz.require(authz.collection(right, collection.id))
    return collection


@collections_api.route('/api/collections')
def index():
    collections = authz.collections(authz.READ)
    if not len(collections):
        return jsonify(Pager([]))
    q = session.query(Collection)
    q = q.filter(Collection.id.in_(collections))
    q = q.options(subqueryload('subjects'))
    q = q.order_by(Collection.title.asc())
    return jsonify(Pager(q))


@collections_api.route('/api/collections', methods=['POST', 'PUT'])
def create():
    authz.require(authz.logged_in())
    data = request_data()
    validate(data, collections_schema)
    collection = Collection()
    collection.title = data.get('title')
    session.add(collection)
    update_subjects(collection, data)
    session.flush()
    permission = Permission()
    permission.resource_id = collection.id
    permission.resource_type = Permission.COLLECTION
    permission.read = True
    permission.write = True
    permission.role_id = request.auth_user
    session.add(permission)
    session.commit()
    return jsonify({'status': 'ok', 'data': collection}, status=201)


@collections_api.route('/api/collections/<int:id>')
def view(id):
    collection = get_collection(id, authz.READ)
    return jsonify({'status': 'ok', 'data': collection})


@collections_api.route('/api/collections/<int:id>', methods=['POST', 'PUT'])
def update(id):
    collection = get_collection(id, authz.WRITE)
    data = request_data()
    validate(data, collections_schema)
    collection.title = data.get('title')
    session.add(collection)
    update_subjects(collection, data)
    session.commit()
    return jsonify({'status': 'ok', 'data': collection})
