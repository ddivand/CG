using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Random = UnityEngine.Random;

public class platform : MonoBehaviour
{
    private void OnCollisionExit2D(Collision2D other)
    {
        if (other.collider.CompareTag("Respawn"))
        {
            float x = Random.Range(-1.9f, 1.9f);
            var position = transform.position;
            float y = Random.Range(position.y + 20f, position.y + 22f);
            
            transform.position = new Vector3(x,y,0);
        }
    }

}
