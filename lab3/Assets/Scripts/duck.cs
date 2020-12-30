using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class duck : MonoBehaviour
{
    public Rigidbody2D rigidbody;

    public float jumpForce;

    public float moveSpeed;

    public float health;

    //public bool flag;

    private SpriteRenderer _spriteRenderer;

    // Start is called before the first frame update
    void Start()
    {
        _spriteRenderer = gameObject.GetComponent<SpriteRenderer>();
        health = 100;        

    }

    // Update is called once per frame
    void Update()
    {
        if (Input.GetKey(KeyCode.RightArrow))
        {
            _spriteRenderer.flipX = true;
            transform.Translate(Vector2.right * (moveSpeed * Time.deltaTime));
        }

        if (Input.GetKey(KeyCode.LeftArrow))
        {
            _spriteRenderer.flipX = false;
            transform.Translate(Vector2.left * (moveSpeed * Time.deltaTime));
        }
        
    }

    void OnTriggerStay2D(Collider2D collider)
    {
        //if(collision.relativeVelocity.y > 0)            
        //if (flag)
        //            return;

        rigidbody.AddForce(Vector2.up * jumpForce, ForceMode2D.Impulse);
        health = health - 0.01f;
        Debug.Log(health);
    }      

    
  private void OnCollisionEnter2D(Collision2D collision)
    {
        
        if (collision.collider.CompareTag("Respawn"))
        {
            SceneManager.LoadScene(0);
        }

        if(collision.relativeVelocity.y > 0)
            rigidbody.AddForce(Vector2.up*jumpForce, ForceMode2D.Impulse);
        
    }
    
}
