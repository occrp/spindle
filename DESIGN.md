
## Next Steps

* Result highlights -- done
* No nested indexing -- done
* Demo data loader -- done
* Front-End Navbar -- done
* Collections / Projects -- done
* Roles / Users+Groups -- done
* Add ownership type relation -- done
* Collection permissions -- done
* Source permissions -- done
* Search authz filters -- done (tbd: entity rendering)
* Implement entity auto-suggest -- done
* Admin flag -- done
* Schema expander -- done
* Entity authz filters -- done
* Entities R/W API
* Entities updates
* Ownership type (Company, Asset) -- done
* Collection grid view
* Layout once-over

Post-Istanbul:
* Embeddable entities for other sites
* Image uploading/storage for entities
* Records de-ref, layer
* Records indexing

* http://docs.handsontable.com/0.20.0/tutorial-quick-start.html

## Domain Model

Collection
    CollectionEntity

## Permissions/Authorization Model

Role: User, Network, Groups
    id
    name
    type
    is_admin

Resource: Collection, Source

Permission (Identity, Resource)
    role
    resource_type
    resource_id

Places where authz matters:
    * REST API
    * Entity construction

Places where users matter:
    * Collections (create / access)
    * Statement authorship

Statement:
    * subject
    * predicate
    * object
    * source_id
    * collection
    * author
    * created_at
