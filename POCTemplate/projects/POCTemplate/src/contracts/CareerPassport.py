from pyteal import *

def career_passport_approval():
    """
    Career Passport smart contract approval program.
    Stores credentials per ASA in box storage.
    Supports CRUD: add, view, modify, delete.
    """

    # Operation argument
    op = Txn.application_args[0]

    # Box key per ASA: "credentials-<ASA_ID>"
    # ASA ID is passed in ForeignAssets[0]
    asa_id_bytes = Itob(Txn.assets[0])
    box_key = Concat(Bytes("credentials-"), asa_id_bytes)

    # --- Add Credential ---
    add_credential = Seq([
        Assert(Txn.application_args.length() == Int(2)),  # ["addCredential", JSON_string]
        If(Not(App.box_exists(box_key)),
           App.box_put(box_key, Txn.application_args[1]),
           App.box_put(box_key, Concat(App.box_get(box_key), Bytes(","), Txn.application_args[1]))
        ),
        Approve()
    ])

    # --- View Credentials ---
    view_credentials = Seq([
        Assert(Txn.application_args.length() == Int(1)),  # ["viewCredentials"]
        If(App.box_exists(box_key),
           Approve(),  # frontend can read box via algod client
           Reject()
        )
    ])

    # --- Modify Credential ---
    modify_credential = Seq([
        Assert(Txn.application_args.length() == Int(3)),  # ["modifyCredential", index, JSON_string]
        Assert(App.box_exists(box_key)),

        # Load existing credentials
        existing = App.box_get(box_key),
        creds_bytes = existing.value(),
        creds_array = Split(creds_bytes, Bytes(",")),

        idx = Btoi(Txn.application_args[1]),
        Assert(idx < Len(creds_array)),

        # Replace credential at index
        new_creds = ConcatArray(Seq([
            If(i == idx, Txn.application_args[2], creds_array[i]) for i in range(Len(creds_array))
        ])),

        App.box_put(box_key, new_creds),
        Approve()
    ])

    # --- Delete Credential ---
    delete_credential = Seq([
        Assert(Txn.application_args.length() == Int(2)),  # ["deleteCredential", index]
        Assert(App.box_exists(box_key)),

        existing = App.box_get(box_key),
        creds_bytes = existing.value(),
        creds_array = Split(creds_bytes, Bytes(",")),

        idx = Btoi(Txn.application_args[1]),
        Assert(idx < Len(creds_array)),

        new_creds = ConcatArray(Seq([
            creds_array[i] for i in range(Len(creds_array)) if i != idx
        ])),

        App.box_put(box_key, new_creds),
        Approve()
    ])

    # --- Operation Routing ---
    program = Cond(
        [op == Bytes("addCredential"), add_credential],
        [op == Bytes("viewCredentials"), view_credentials],
        [op == Bytes("modifyCredential"), modify_credential],
        [op == Bytes("deleteCredential"), delete_credential]
    )

    return program

def clear_state_program():
    return Approve()
