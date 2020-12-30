using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class camera : MonoBehaviour
{

    public Transform duckPos;
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        if (duckPos.position.y > transform.position.y)
        {
            var position = duckPos.position;
            transform.position = new Vector3(0,position.y,-10f);
        }
    }
}
