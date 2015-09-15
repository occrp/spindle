from schwifty.core import es, es_index

QUERY_FIELDS = ['raw.*']
# FIXME: need to force all raw fields to be strings.
# QUERY_FIELDS = ['_all']
DEFAULT_FIELDS = ['source.*', 'id', 'schema', 'entity.*']


def query(text):
    text = text.strip()

    if len(text):
        q = {
            "bool": {
                "must": {
                    "multi_match": {
                        "query": text,
                        "fields": QUERY_FIELDS,
                        "type": "best_fields",
                        "cutoff_frequency": 0.0007,
                        "operator": "and",
                    },
                },
                "should": {
                    "multi_match": {
                        "query": text,
                        "fields": QUERY_FIELDS,
                        "type": "phrase"
                    },
                }
            }
        }
    else:
        q = {'match_all': {}}

    q = {
        'query': q,
        '_source': DEFAULT_FIELDS
    }

    result = es.search(index=es_index, body=q)
    hits = result.get('hits', {})
    output = {
        'status': 'ok',
        'results': [],
        'total':  hits.get('total')
    }
    for doc in hits.get('hits', []):
        data = doc.get('_source')
        data['type'] = doc.get('_type')
        output['results'].append(data)
    return output